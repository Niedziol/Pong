/**
 * Po ka�dym odbiciu kulka troszk� przyspiesza, tak �eby gra by�a coraz bardziej dynamiczna ale �eby nie ko�czy�a si� zbyt szybko
 * Paletka jest podzielona na 8 cz�ci gdzie skrajne odbijaj� o najwi�kszy k�t, a im bardziej do �rodka tym mniej tak jak na rysunku w poleceniu
 * Wci�ni�cie r rozpoczyna gr� i powoduje te� swoisty force reset kt�ry zeruje wszystkie ustawienia
 * Przyciski od 1 - 3 zwi�kszaj� liczb� graczy oraz pi�ek
 * Przyciski od 4 - 6 zwi�kszaj� poziom trudno�ci (kulki lec� z wyj�ciow� wi�ksz� pr�dko�ci�, paletki s� w�sze)
 * Przycisk 7 powoduje "wrzucenie" na plansz� nowych pi�ek z zachowaniem aktualnych wynik�w i ustawie� dot. liczby graczy i poziomu trudno�ci
 * Zastanawia�em si� nad implementacj� dynamicznego wrzucania nowych kulek (czyli np mamy 3 kulki na planszy 1 zostanie wbita to natychmiast pojawia si� nowa, tak aby na planszy by�y zawsze 3 kulki), ale uzna�em �e zostawienie tego w taki spos�b jest ciekawsze bo pocz�tek gry jest trudny ze wzgl�du na ilo�� kulek a koniec rundy jest trudny ze wzgl�du na coraz wi�ksz� pr�dkos� mniejszej ilo�ci kulek.
 * Nie wiem w jaki spos�b sprawdzacie program, czy zczytujecie wszystkie pliki nam dost�pne, czy tylko gra.js i "wstawiacie" to w sw�j szablon, ale po klikni�ciu przycisku r gr� nale�y wywo�a� nowaGra(0, 0, 1, 96); co te� zmieni�em w index.html
 * */




/** Maksymalny rozmiar planszy (w pikslach), od lewej do prawej. Warto�� najwi�ksza jest po prawej stronie. */
var maxX = 800;
/** Maksymalny rozmiar planszy (w pikslach), od g�ry do do�u. Warto�� najwi�ksza jest u do�u. */
var maxY = 400;
/** Szeroko�� marginesu (wp�ywa na to, jak rysujemy prostok�ty i jak dalego od brzegu odbijaj� si� pi�ki) */
var margines = 20;


/**    
Struktura danych opisuj�ca pojedynczego gracza. Dla gracza pami�tamy
- czy jest prawy czy lewy
- jego wsp�rz�dn� x-ow� (lew�)
- jego wsp�rz�dny� y-rekow� (g�rn�)
- d�ugo�� (jak daleko w d� si�ga prostok�t)
- szeroko�� (jak daleko w bok si�ga prostok�t. nie wp�ywa na logik� gry)
- pr�dko�� z jak� przesuwa si� prostok�t przy naciskaniu przycisk�w g�ra/d�
- czy aktualnie naci�ni�ty przycisk g�ra (rusza_sie_w_gore) lub d� (rusza_sie_w_dol)
- klawisze u�ywane do przesuwania w g�r�/d�.

Funkcja aktualizujPozycje() przesuwa prostok�t na d�/w g�r� lub pozostawia go w starym
miejscu, w zale�no�ci od naci�ni�tego przycisku i faktu, czy gracz by� ju� na brzego planszy
(nie wychodzimy poza brzeg).
*/
function nowyGracz(LlubP, klawiszWGore, klawiszWDol, dlugosc) {
  return  {
    /** W polach kt�ryGracz, x, y, dlugosc itd. zapami�tujemy stan gracza (prostok�ta). */
    ktoryGracz: LlubP,
    x: LlubP === "L" ? 4 : maxX - margines,
    y: maxY/2,
    dlugosc: dlugosc,
    szerokosc: 16,
    predkosc: 8,
    rusza_sie_w_gore: false, // pole na kt�rym zapiszemy 'true' po naci�ni�ciu 
                             // klawisza 'w g�r�' dla tego gracza
    rusza_sie_w_dol: false,  // analogiczne pole dla klawisa 'w d�'
    klawiszWDol: klawiszWDol,
    klawiszWGore: klawiszWGore,
    
    /** Funkcja dotycz�ce tego obiektu (tak zwana "metoda") aktualizuj�ca pozycj� gracza */
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
 * Funkcja tworz�ca now� pi�k�. Dla pi�ki pami�tamy
 * - jej wsp�rz�dne x i y (poziom� i pionow�)
 * - pr�dko�� z jak� ostatnio porusza�a si� w poziomie (na boki, predkosc_x) i w pionie (g�ra/d� predkosc_y)
 * - �rednic� pi�ki (u�ywane tylko do rysowania mniejszych/wiekszych pilek)
 * - zmienna 'aktywa', ustawiona na 'true' jesli pilka jest ciagle w grze i na 'false', jesli
 *   wyszla juz poza plansze.
 * 
 * Definiujemy te� funkcj� 'aktualizujPozycje' pi�ki, kt�ra zmienia jej po�o�enie w zale�no�ci
 * od poprzedniego po�o�enia i pr�dko�ci.
 */
function nowaPilka(x, y, maksymalnaPredkosc_x, srednicaPilki) {
  return {
    /** W polach x, y, predkosc_x itd. zapami�tujemy stan pi�ki */
    x: x,
    y: y,
    predkosc_x: losowaPredkoscWLosowymKierunku(1) * 7 /** -7 lub +7 */,
    predkosc_y: losowaPredkoscWLosowymKierunku(7) /** Losowa liczba od -7 do +7 opr�cz 0 */,
    srednicaPilki: srednicaPilki,
    aktywna: true,
   
    
    /** Funkcja dotycz�ce tego obiektu (tak zwana "metoda") aktualizuj�ca pozycj� pi�ki */
    aktualizujPozycje: function () {
      /**przyspieszenia y i x odpowiadaj� za przyspieszenie w kierunkach odpowiednio pionowym i poziomym*/
      /**maj� powoli coraz bardziej zwi�ksza� pr�dko�� pi�ki �eby z ka�d� sekund� gra stawa�a si� coraz trudniejsza*/
      if (!this.aktywna) {
        // Je�li pi�ka wysz�a ju� poza plansz� nic z ni� nie robimy.
        return;
      }
      // Odbijanie pi�ki od sufitu/pod�ogi:
      if (this.y > maxY-margines && this.predkosc_y > 0 || this.y < margines && this.predkosc_y < 0) {
        this.predkosc_y *= -1;
      }
      var k;
      // i przesuwamy pi�k� w pionie:
      this.y += this.predkosc_y;
      //this.predkosc_y += przyspieszenie_y;
      // Doj�cie do lewego/prawego boku. Je�li na odpowiedniej wysoko�ci znajduje si�
      // prostok�t gracza, pi�ka odbije si� w drug� stron�, w przeciwnym wypadku
      // wyjdzie poza plansze i stanie si� "nieaktywna".
      if (this.x > maxX-margines && this.predkosc_x > 0) { // prawy bok
        this.predkosc_x *= -1.1;
        // Jesli nie istnieje prawy ("P") gracz taki, ze pileczka przecina sie z rakietk� tego
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
      // i przesuwamy pi�k� w poziomie:
      this.x += this.predkosc_x;
    }
  };
}

// Lista graczy i lista pi�eczek. Wszystkie zmienne inicjalizujemy w funkcji 'nowaGra',
// kt�ra wo�ana jest na pocz�tku gry oraz po ka�dym naci�ni�ciu klawisza 'r' (reset).
var gracze = [];
var pileczki = [];
// Ile pi�eczek wygra� ju� gracz lewy/prawy
var wygraneGraczaLewego;
var wygraneGraczaPrawego;
var szerokosc_paletek;
var ile_paletek;
var mnoznik = 0.5;
function stanGry() {
  return "LEWY: " + wygraneGraczaLewego + "  VS  PRAWY: " + wygraneGraczaPrawego;
}

// Funkcja inicjalizuj�ca now� gr�.
function nowaGra(winl, winr, ile, szerokosc_p) {
  szerokosc_paletek = szerokosc_p;
  ile_paletek = ile;
  wygraneGraczaLewego = winl;
  wygraneGraczaPrawego = winr;
  // Dla ka�dego gracza podajemy:
  // - czy jest on lewy czy prawy (L/P)
  // - przyciski g�ra/d� u�ywane przez tego gracza.
  // - d�ugo�� prostok�ta tego gracza.
  // U�ywamy dw�ch graczy, ale Ty mo�esz u�y� wi�cej, np. odkomentowuj�c 
  // �rodkowy wpis w tablicy 'gracze'.
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
    
  // Dla ka�dej pi�eczki podajemy
  // - jej startowe wsp�rz�dne X i Y
  // - maksymaln� pr�dko�c z jak� si� ona porusza. funkcja nowaPilka wylosuje Warto��
  //   od 0 do tej maksymalnej pr�dko�ci (poni�ej u�ywamy maksymalnej predkosci 7)
  // - �rednica pi�eczki, przydatna (�atwiej si� ogl�da) kiedy u�ywamy wi�cej ni� jednej.
  // Je�li chcesz u�y� wi�cej ni� jednej pi�eczki, mo�esz np. odkomentowa� pierwsze dwa
  // elementy tablicy poni�ej.

}

/** Funkcja sprawdza, czy we wsp�rz�dnej 'y' jest jaki� gracz lewy (je�li LlubP == 'L')
 * lub prawy (je�li LlubP == 'P') */
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
  wypiszNaEkran("Pi�ka wypad�a po strone " + LlubP + " na wysoko�ci " + y);
  return false;
}

/**
 * Jesli chcesz dodac jakas fajna funkcjonalnosc, mozesz wykorzystac funkcje ponizej. 
 * Po nacisniecu cyfry N (od 0 do 9) wywola sie wybrana przez Ciebie funkcja. O, my 
 * na przyklad po wcisni�ciu cyfry '7' restartujemy gre (nigdzie indziej o tym nie
 * powiedzielismy - ha!).
 */
function wcisnietoCyfreN(N) {
  if (N === '0') {
  } else if (N === '1') {
    nowaGra(wygraneGraczaLewego, wygraneGraczaPrawego, 1, szerokosc_paletek);//od 1 - 3 zmiana liczby graczy (a wi�c i kulek)
  } else if (N === '2') {
    nowaGra(wygraneGraczaLewego, wygraneGraczaPrawego, 2, szerokosc_paletek);
  } else if(N === '3') {
    nowaGra(wygraneGraczaLewego, wygraneGraczaPrawego, 3, szerokosc_paletek);
  } else if(N === '4'){
    mnoznik = 0.5;
    nowaGra(wygraneGraczaLewego, wygraneGraczaPrawego, ile_paletek, 96); //od 4 - 6 zmiana poziomu trudno�ci
  } else if(N === '5'){
    mnoznik = 0.8;
    nowaGra(wygraneGraczaLewego, wygraneGraczaPrawego, ile_paletek, 80);
  } else if(N === '6'){
    mnoznik = 1.2;
    nowaGra(wygraneGraczaLewego, wygraneGraczaPrawego, ile_paletek, 64);
  } else if (N === '7') {
    nowaGra(wygraneGraczaLewego, wygraneGraczaPrawego, ile_paletek, szerokosc_paletek); //restart gry bez zmiany poprzednich ustawie�
  } // ...
}

/** Funkcja zwraca losow� warto�� od -maksymalnaPredkosc do +maksymalnaPredkosc z 
 * pomini�ciem zera. Nie przejmuj si�, je�li nie rozumiesz do ko�ca co tu si� dzieje */
function losowaPredkoscWLosowymKierunku(maksymalnaPredkosc) {
  wynik = Math.round((Math.random() * 2 * maksymalnaPredkosc) - maksymalnaPredkosc);
  if (wynik === 0) {
    return losowaPredkoscWLosowymKierunku(maksymalnaPredkosc);
  }
  return wynik * mnoznik;
}