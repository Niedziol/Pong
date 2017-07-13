/**
 * Po ka¿dym odbiciu kulka troszkê przyspiesza, tak ¿eby gra by³a coraz bardziej dynamiczna ale ¿eby nie koñczy³a siê zbyt szybko
 * Paletka jest podzielona na 8 czêœci gdzie skrajne odbijaj¹ o najwiêkszy k¹t, a im bardziej do œrodka tym mniej tak jak na rysunku w poleceniu
 * Wciœniêcie r rozpoczyna grê i powoduje te¿ swoisty force reset który zeruje wszystkie ustawienia
 * Przyciski od 1 - 3 zwiêkszaj¹ liczbê graczy oraz pi³ek
 * Przyciski od 4 - 6 zwiêkszaj¹ poziom trudnoœci (kulki lec¹ z wyjœciow¹ wiêksz¹ prêdkoœci¹, paletki s¹ wê¿sze)
 * Przycisk 7 powoduje "wrzucenie" na planszê nowych pi³ek z zachowaniem aktualnych wyników i ustawieñ dot. liczby graczy i poziomu trudnoœci
 * Zastanawia³em siê nad implementacj¹ dynamicznego wrzucania nowych kulek (czyli np mamy 3 kulki na planszy 1 zostanie wbita to natychmiast pojawia siê nowa, tak aby na planszy by³y zawsze 3 kulki), ale uzna³em ¿e zostawienie tego w taki sposób jest ciekawsze bo pocz¹tek gry jest trudny ze wzglêdu na iloœæ kulek a koniec rundy jest trudny ze wzglêdu na coraz wiêksz¹ prêdkosæ mniejszej iloœci kulek.
 * Nie wiem w jaki sposób sprawdzacie program, czy zczytujecie wszystkie pliki nam dostêpne, czy tylko gra.js i "wstawiacie" to w swój szablon, ale po klikniêciu przycisku r grê nale¿y wywo³aæ nowaGra(0, 0, 1, 96); co te¿ zmieni³em w index.html
 * */




/** Maksymalny rozmiar planszy (w pikslach), od lewej do prawej. Wartoœæ najwiêksza jest po prawej stronie. */
var maxX = 800;
/** Maksymalny rozmiar planszy (w pikslach), od góry do do³u. Wartoœæ najwiêksza jest u do³u. */
var maxY = 400;
/** Szerokoœæ marginesu (wp³ywa na to, jak rysujemy prostok¹ty i jak dalego od brzegu odbijaj¹ siê pi³ki) */
var margines = 20;


/**    
Struktura danych opisuj¹ca pojedynczego gracza. Dla gracza pamiêtamy
- czy jest prawy czy lewy
- jego wspó³rzêdn¹ x-ow¹ (lew¹)
- jego wspó³rzêdny¹ y-rekow¹ (górn¹)
- d³ugoœæ (jak daleko w dó³ siêga prostok¹t)
- szerokoœæ (jak daleko w bok siêga prostok¹t. nie wp³ywa na logikê gry)
- prêdkoœæ z jak¹ przesuwa siê prostok¹t przy naciskaniu przycisków góra/dó³
- czy aktualnie naciœniêty przycisk góra (rusza_sie_w_gore) lub dó³ (rusza_sie_w_dol)
- klawisze u¿ywane do przesuwania w górê/dó³.

Funkcja aktualizujPozycje() przesuwa prostok¹t na dó³/w górê lub pozostawia go w starym
miejscu, w zale¿noœci od naciœniêtego przycisku i faktu, czy gracz by³ ju¿ na brzego planszy
(nie wychodzimy poza brzeg).
*/
function nowyGracz(LlubP, klawiszWGore, klawiszWDol, dlugosc) {
  return  {
    /** W polach któryGracz, x, y, dlugosc itd. zapamiêtujemy stan gracza (prostok¹ta). */
    ktoryGracz: LlubP,
    x: LlubP === "L" ? 4 : maxX - margines,
    y: maxY/2,
    dlugosc: dlugosc,
    szerokosc: 16,
    predkosc: 8,
    rusza_sie_w_gore: false, // pole na którym zapiszemy 'true' po naciœniêciu 
                             // klawisza 'w górê' dla tego gracza
    rusza_sie_w_dol: false,  // analogiczne pole dla klawisa 'w dó³'
    klawiszWDol: klawiszWDol,
    klawiszWGore: klawiszWGore,
    
    /** Funkcja dotycz¹ce tego obiektu (tak zwana "metoda") aktualizuj¹ca pozycjê gracza */
    aktualizujPozycje: function () {
      if (this.rusza_sie_w_dol && this.y < maxY - this.dlugosc) {
        this.y += this.predkosc;
      } else if (this.rusza_sie_w_gore && this.y > 0) {
        this.y -= this.predkosc;
      }
    }
  };
}

/**
 * Funkcja tworz¹ca now¹ pi³kê. Dla pi³ki pamiêtamy
 * - jej wspó³rzêdne x i y (poziom¹ i pionow¹)
 * - prêdkoœæ z jak¹ ostatnio porusza³a siê w poziomie (na boki, predkosc_x) i w pionie (góra/dó³ predkosc_y)
 * - œrednicê pi³ki (u¿ywane tylko do rysowania mniejszych/wiekszych pilek)
 * - zmienna 'aktywa', ustawiona na 'true' jesli pilka jest ciagle w grze i na 'false', jesli
 *   wyszla juz poza plansze.
 * 
 * Definiujemy te¿ funkcjê 'aktualizujPozycje' pi³ki, która zmienia jej po³o¿enie w zale¿noœci
 * od poprzedniego po³o¿enia i prêdkoœci.
 */
function nowaPilka(x, y, maksymalnaPredkosc_x, srednicaPilki) {
  return {
    /** W polach x, y, predkosc_x itd. zapamiêtujemy stan pi³ki */
    x: x,
    y: y,
    predkosc_x: losowaPredkoscWLosowymKierunku(1) * 7 /** -7 lub +7 */,
    predkosc_y: losowaPredkoscWLosowymKierunku(7) /** Losowa liczba od -7 do +7 oprócz 0 */,
    srednicaPilki: srednicaPilki,
    aktywna: true,
   
    
    /** Funkcja dotycz¹ce tego obiektu (tak zwana "metoda") aktualizuj¹ca pozycjê pi³ki */
    aktualizujPozycje: function () {
      /**przyspieszenia y i x odpowiadaj¹ za przyspieszenie w kierunkach odpowiednio pionowym i poziomym*/
      /**maj¹ powoli coraz bardziej zwiêkszaæ prêdkoœæ pi³ki ¿eby z ka¿d¹ sekund¹ gra stawa³a siê coraz trudniejsza*/
      if (!this.aktywna) {
        // Jeœli pi³ka wysz³a ju¿ poza planszê nic z ni¹ nie robimy.
        return;
      }
      // Odbijanie pi³ki od sufitu/pod³ogi:
      if (this.y > maxY-margines && this.predkosc_y > 0 || this.y < margines && this.predkosc_y < 0) {
        this.predkosc_y *= -1;
      }
      var k;
      // i przesuwamy pi³kê w pionie:
      this.y += this.predkosc_y;
      //this.predkosc_y += przyspieszenie_y;
      // Dojœcie do lewego/prawego boku. Jeœli na odpowiedniej wysokoœci znajduje siê
      // prostok¹t gracza, pi³ka odbije siê w drug¹ stronê, w przeciwnym wypadku
      // wyjdzie poza plansze i stanie siê "nieaktywna".
      if (this.x > maxX-margines && this.predkosc_x > 0) { // prawy bok
        this.predkosc_x *= -1.1;
        // Jesli nie istnieje prawy ("P") gracz taki, ze pileczka przecina sie z rakietk¹ tego
        // gracza (this.y lezy powyzej poczatku 'y' i ponizej konca rakietki 'y-dlugosc') wtedy
        // pozbywamy sie pileczki ustawiajac:
        if (czyWeWspolrzednejYJestJakisGracz("P", this.y) === false) {
          this.aktywna = false;
          // i aktualizujemy 'stanGry' w odpowiedni sposob
          wygraneGraczaLewego += 1;
        } else {
          k = czyWeWspolrzednejYJestJakisGracz("P", this.y);
          wypiszNaEkran(k);
          this.predkosc_y = this.predkosc_x * k;
        }
      } else if (this.x < margines && this.predkosc_x < 0) { // lewy bok
        this.predkosc_x *= -1.1;
        if (czyWeWspolrzednejYJestJakisGracz("L", this.y) === false) {
          this.aktywna = false;
          // i aktualizujemy 'stanGry' w odpowiedni sposob
          wygraneGraczaPrawego += 1;
        } else {
          k = czyWeWspolrzednejYJestJakisGracz("L", this.y);
          //wypiszNaEkran(k);
          this.predkosc_y = this.predkosc_x * k;
        }
      }
      // i przesuwamy pi³kê w poziomie:
      this.x += this.predkosc_x;
    }
  };
}

// Lista graczy i lista pi³eczek. Wszystkie zmienne inicjalizujemy w funkcji 'nowaGra',
// która wo³ana jest na pocz¹tku gry oraz po ka¿dym naciœniêciu klawisza 'r' (reset).
var gracze = [];
var pileczki = [];
// Ile pi³eczek wygra³ ju¿ gracz lewy/prawy
var wygraneGraczaLewego;
var wygraneGraczaPrawego;
var szerokosc_paletek;
var ile_paletek;
var mnoznik = 0.5;
function stanGry() {
  return "LEWY: " + wygraneGraczaLewego + "  VS  PRAWY: " + wygraneGraczaPrawego;
}

// Funkcja inicjalizuj¹ca now¹ grê.
function nowaGra(winl, winr, ile, szerokosc_p) {
  szerokosc_paletek = szerokosc_p;
  ile_paletek = ile;
  wygraneGraczaLewego = winl;
  wygraneGraczaPrawego = winr;
  // Dla ka¿dego gracza podajemy:
  // - czy jest on lewy czy prawy (L/P)
  // - przyciski góra/dó³ u¿ywane przez tego gracza.
  // - d³ugoœæ prostok¹ta tego gracza.
  // U¿ywamy dwóch graczy, ale Ty mo¿esz u¿yæ wiêcej, np. odkomentowuj¹c 
  // œrodkowy wpis w tablicy 'gracze'.
  if(ile == 1){
    gracze = [
      nowyGracz("L", 'a', 'z', szerokosc_paletek),
      nowyGracz("P", 'k', 'm', szerokosc_paletek)
    ];
    pileczki = [
    nowaPilka(maxX/2, maxY/2, 7, 15)];
  }
  if(ile == 2){
    gracze = [
      nowyGracz("L", 'd', 'c', szerokosc_paletek),
      nowyGracz("L", 'a', 'z', szerokosc_paletek),
      nowyGracz("P", 'k', 'm', szerokosc_paletek),
      nowyGracz("P", ';', '.', szerokosc_paletek)
    ];
    pileczki = [
    nowaPilka(maxX/2, maxY/2, 7, 9),
    nowaPilka(maxX/2, maxY/2, 7, 15)];
  }
  
  if(ile == 3){
    gracze = [
      nowyGracz("L", 'd', 'c', szerokosc_paletek),
      nowyGracz("L", 'a', 'z', szerokosc_paletek),
      nowyGracz("L", 't', 'g', szerokosc_paletek),
      nowyGracz("P", 'k', 'm', szerokosc_paletek),
      nowyGracz("P", ';', '.', szerokosc_paletek),
      nowyGracz("P", 'u', 'h', szerokosc_paletek)
    ];
    pileczki = [
    nowaPilka(maxX/2, maxY/2, 7, 3),
    nowaPilka(maxX/2, maxY/2, 7, 9),
    nowaPilka(maxX/2, maxY/2, 7, 15)];
  }
    
  // Dla ka¿dej pi³eczki podajemy
  // - jej startowe wspó³rzêdne X i Y
  // - maksymaln¹ prêdkoœc z jak¹ siê ona porusza. funkcja nowaPilka wylosuje Wartoœæ
  //   od 0 do tej maksymalnej prêdkoœci (poni¿ej u¿ywamy maksymalnej predkosci 7)
  // - œrednica pi³eczki, przydatna (³atwiej siê ogl¹da) kiedy u¿ywamy wiêcej ni¿ jednej.
  // Jeœli chcesz u¿yæ wiêcej ni¿ jednej pi³eczki, mo¿esz np. odkomentowaæ pierwsze dwa
  // elementy tablicy poni¿ej.

}

/** Funkcja sprawdza, czy we wspó³rzêdnej 'y' jest jakiœ gracz lewy (jeœli LlubP == 'L')
 * lub prawy (jeœli LlubP == 'P') */
function czyWeWspolrzednejYJestJakisGracz(LlubP, y) {
  for (var i = 0; i < gracze.length; i++) {
    gracz = gracze[i];
    var k;
    if (gracz.ktoryGracz === LlubP && y >= gracz.y && y <= (gracz.y + gracz.dlugosc)) {
       if(y>(gracz.y + (0 * gracz.dlugosc / 8)) && y<=(gracz.y + (gracz.dlugosc / 8)))k = 1;
       if((y>(gracz.y + (7 * gracz.dlugosc / 8))) && y<=(gracz.y + (8 * gracz.dlugosc / 8)))k = -1;
       if(y>(gracz.y + (gracz.dlugosc / 8)) && y<=(gracz.y + (2 * gracz.dlugosc / 8)))k = 0.6;
       if((y>(gracz.y + (6 * gracz.dlugosc / 8))) && y<=(gracz.y + (7 * gracz.dlugosc / 8)))k = -0.6
       if(y>(gracz.y + (2 * gracz.dlugosc / 8)) && y<=(gracz.y + (3 * gracz.dlugosc / 8)))k = 0.3;
       if((y>(gracz.y + (5 * gracz.dlugosc / 8))) && y<=(gracz.y + (6 * gracz.dlugosc / 8)))k = -0.3;
       if(y>(gracz.y + (3 * gracz.dlugosc / 8)) && y<=(gracz.y + (4 * gracz.dlugosc / 8)) || (y>(gracz.y + (4 * gracz.dlugosc / 8))) && y<=(gracz.y + (5 * gracz.dlugosc / 8)))return 0;
      
      if(LlubP === "L")return k * -1;
      else return k;
    }
  }
  wypiszNaEkran("Pi³ka wypad³a po strone " + LlubP + " na wysokoœci " + y);
  return false;
}

/**
 * Jesli chcesz dodac jakas fajna funkcjonalnosc, mozesz wykorzystac funkcje ponizej. 
 * Po nacisniecu cyfry N (od 0 do 9) wywola sie wybrana przez Ciebie funkcja. O, my 
 * na przyklad po wcisniêciu cyfry '7' restartujemy gre (nigdzie indziej o tym nie
 * powiedzielismy - ha!).
 */
function wcisnietoCyfreN(N) {
  if (N === '0') {
  } else if (N === '1') {
    nowaGra(wygraneGraczaLewego, wygraneGraczaPrawego, 1, szerokosc_paletek);//od 1 - 3 zmiana liczby graczy (a wiêc i kulek)
  } else if (N === '2') {
    nowaGra(wygraneGraczaLewego, wygraneGraczaPrawego, 2, szerokosc_paletek);
  } else if(N === '3') {
    nowaGra(wygraneGraczaLewego, wygraneGraczaPrawego, 3, szerokosc_paletek);
  } else if(N === '4'){
    mnoznik = 0.5;
    nowaGra(wygraneGraczaLewego, wygraneGraczaPrawego, ile_paletek, 96); //od 4 - 6 zmiana poziomu trudnoœci
  } else if(N === '5'){
    mnoznik = 0.8;
    nowaGra(wygraneGraczaLewego, wygraneGraczaPrawego, ile_paletek, 80);
  } else if(N === '6'){
    mnoznik = 1.2;
    nowaGra(wygraneGraczaLewego, wygraneGraczaPrawego, ile_paletek, 64);
  } else if (N === '7') {
    nowaGra(wygraneGraczaLewego, wygraneGraczaPrawego, ile_paletek, szerokosc_paletek); //restart gry bez zmiany poprzednich ustawieñ
  } // ...
}

/** Funkcja zwraca losow¹ wartoœæ od -maksymalnaPredkosc do +maksymalnaPredkosc z 
 * pominiêciem zera. Nie przejmuj siê, jeœli nie rozumiesz do koñca co tu siê dzieje */
function losowaPredkoscWLosowymKierunku(maksymalnaPredkosc) {
  wynik = Math.round((Math.random() * 2 * maksymalnaPredkosc) - maksymalnaPredkosc);
  if (wynik === 0) {
    return losowaPredkoscWLosowymKierunku(maksymalnaPredkosc);
  }
  return wynik * mnoznik;
}