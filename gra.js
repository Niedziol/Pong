/**
 * Po każdym odbiciu kulka troszkę przyspiesza, tak żeby gra była coraz bardziej dynamiczna ale żeby nie kończyła się zbyt szybko
 * Paletka jest podzielona na 8 części gdzie skrajne odbijają o największy kąt, a im bardziej do środka tym mniej tak jak na rysunku w poleceniu
 * Wciśnięcie r rozpoczyna grę i powoduje też swoisty force reset który zeruje wszystkie ustawienia
 * Przyciski od 1 - 3 zwiększają liczbę graczy oraz piłek
 * Przyciski od 4 - 6 zwiększają poziom trudności (kulki lecą z wyjściową większą prędkością, paletki są węższe)
 * Przycisk 7 powoduje "wrzucenie" na planszę nowych piłek z zachowaniem aktualnych wyników i ustawień dot. liczby graczy i poziomu trudności
 * */




/** Maksymalny rozmiar planszy (w pikslach), od lewej do prawej. Wartość największa jest po prawej stronie. */
var maxX = 800;
/** Maksymalny rozmiar planszy (w pikslach), od góry do dołu. Wartość największa jest u dołu. */
var maxY = 400;
/** Szerokość marginesu (wpływa na to, jak rysujemy prostokąty i jak dalego od brzegu odbijają się piłki) */
var margines = 20;


/**    
Struktura danych opisująca pojedynczego gracza. Dla gracza pamiętamy
- czy jest prawy czy lewy
- jego współrzędną x-ową (lewą)
- jego współrzędnyą y-rekową (górną)
- długość (jak daleko w dół sięga prostokąt)
- szerokość (jak daleko w bok sięga prostokąt. nie wpływa na logikę gry)
- prędkość z jaką przesuwa się prostokąt przy naciskaniu przycisków góra/dół
- czy aktualnie naciśnięty przycisk góra (rusza_sie_w_gore) lub dół (rusza_sie_w_dol)
- klawisze używane do przesuwania w górę/dół.

Funkcja aktualizujPozycje() przesuwa prostokąt na dół/w górę lub pozostawia go w starym
miejscu, w zależności od naciśniętego przycisku i faktu, czy gracz był już na brzego planszy
(nie wychodzimy poza brzeg).
*/
function nowyGracz(LlubP, klawiszWGore, klawiszWDol, dlugosc) {
  return  {
    /** W polach któryGracz, x, y, dlugosc itd. zapamiętujemy stan gracza (prostokąta). */
    ktoryGracz: LlubP,
    x: LlubP === "L" ? 4 : maxX - margines,
    y: maxY/2,
    dlugosc: dlugosc,
    szerokosc: 16,
    predkosc: 8,
    rusza_sie_w_gore: false, // pole na którym zapiszemy 'true' po naciśnięciu 
                             // klawisza 'w górę' dla tego gracza
    rusza_sie_w_dol: false,  // analogiczne pole dla klawisa 'w dół'
    klawiszWDol: klawiszWDol,
    klawiszWGore: klawiszWGore,
    
    /** Funkcja dotyczące tego obiektu (tak zwana "metoda") aktualizująca pozycję gracza */
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
 * Funkcja tworząca nową piłkę. Dla piłki pamiętamy
 * - jej współrzędne x i y (poziomą i pionową)
 * - prędkość z jaką ostatnio poruszała się w poziomie (na boki, predkosc_x) i w pionie (góra/dół predkosc_y)
 * - średnicę piłki (używane tylko do rysowania mniejszych/wiekszych pilek)
 * - zmienna 'aktywa', ustawiona na 'true' jesli pilka jest ciagle w grze i na 'false', jesli
 *   wyszla juz poza plansze.
 * 
 * Definiujemy też funkcję 'aktualizujPozycje' piłki, która zmienia jej położenie w zależności
 * od poprzedniego położenia i prędkości.
 */
function nowaPilka(x, y, maksymalnaPredkosc_x, srednicaPilki) {
  return {
    /** W polach x, y, predkosc_x itd. zapamiętujemy stan piłki */
    x: x,
    y: y,
    predkosc_x: losowaPredkoscWLosowymKierunku(1) * 7 /** -7 lub +7 */,
    predkosc_y: losowaPredkoscWLosowymKierunku(7) /** Losowa liczba od -7 do +7 oprócz 0 */,
    srednicaPilki: srednicaPilki,
    aktywna: true,
   
    
    /** Funkcja dotyczące tego obiektu (tak zwana "metoda") aktualizująca pozycję piłki */
    aktualizujPozycje: function () {
      /**przyspieszenia y i x odpowiadają za przyspieszenie w kierunkach odpowiednio pionowym i poziomym*/
      /**mają powoli coraz bardziej zwiększać prędkość piłki żeby z każdą sekundą gra stawała się coraz trudniejsza*/
      if (!this.aktywna) {
        // Jeśli piłka wyszła już poza planszę nic z nią nie robimy.
        return;
      }
      // Odbijanie piłki od sufitu/podłogi:
      if (this.y > maxY-margines && this.predkosc_y > 0 || this.y < margines && this.predkosc_y < 0) {
        this.predkosc_y *= -1;
      }
      var k;
      // i przesuwamy piłkę w pionie:
      this.y += this.predkosc_y;
      //this.predkosc_y += przyspieszenie_y;
      // Dojście do lewego/prawego boku. Jeśli na odpowiedniej wysokości znajduje się
      // prostokąt gracza, piłka odbije się w drugą stronę, w przeciwnym wypadku
      // wyjdzie poza plansze i stanie się "nieaktywna".
      if (this.x > maxX-margines && this.predkosc_x > 0) { // prawy bok
        this.predkosc_x *= -1.1;
        // Jesli nie istnieje prawy ("P") gracz taki, ze pileczka przecina sie z rakietką tego
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
      // i przesuwamy piłkę w poziomie:
      this.x += this.predkosc_x;
    }
  };
}

// Lista graczy i lista piłeczek. Wszystkie zmienne inicjalizujemy w funkcji 'nowaGra',
// która wołana jest na początku gry oraz po każdym naciśnięciu klawisza 'r' (reset).
var gracze = [];
var pileczki = [];
// Ile piłeczek wygrał już gracz lewy/prawy
var wygraneGraczaLewego;
var wygraneGraczaPrawego;
var szerokosc_paletek;
var ile_paletek;
var mnoznik = 0.5;
function stanGry() {
  return "LEWY: " + wygraneGraczaLewego + "  VS  PRAWY: " + wygraneGraczaPrawego;
}

// Funkcja inicjalizująca nową grę.
function nowaGra(winl, winr, ile, szerokosc_p) {
  szerokosc_paletek = szerokosc_p;
  ile_paletek = ile;
  wygraneGraczaLewego = winl;
  wygraneGraczaPrawego = winr;
  // Dla każdego gracza podajemy:
  // - czy jest on lewy czy prawy (L/P)
  // - przyciski góra/dół używane przez tego gracza.
  // - długość prostokąta tego gracza.
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
    
  // Dla każdej piłeczki podajemy
  // - jej startowe współrzędne X i Y
  // - maksymalną prędkośc z jaką się ona porusza. funkcja nowaPilka wylosuje Wartość
  //   od 0 do tej maksymalnej prędkości (poniżej używamy maksymalnej predkosci 7)
  // - średnica piłeczki, przydatna (łatwiej się ogląda) kiedy używamy więcej niż jednej

}

/** Funkcja sprawdza, czy we współrzędnej 'y' jest jakiś gracz lewy (jeśli LlubP == 'L')
 * lub prawy (jeśli LlubP == 'P') */
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
  wypiszNaEkran("Piłka wypadła po strone " + LlubP + " na wysokości " + y);
  return false;
}

function wcisnietoCyfreN(N) {
  if (N === '0') {
  } else if (N === '1') {
    nowaGra(wygraneGraczaLewego, wygraneGraczaPrawego, 1, szerokosc_paletek);//od 1 - 3 zmiana liczby graczy (a więc i kulek)
  } else if (N === '2') {
    nowaGra(wygraneGraczaLewego, wygraneGraczaPrawego, 2, szerokosc_paletek);
  } else if(N === '3') {
    nowaGra(wygraneGraczaLewego, wygraneGraczaPrawego, 3, szerokosc_paletek);
  } else if(N === '4'){
    mnoznik = 0.5;
    nowaGra(wygraneGraczaLewego, wygraneGraczaPrawego, ile_paletek, 96); //od 4 - 6 zmiana poziomu trudności
  } else if(N === '5'){
    mnoznik = 0.8;
    nowaGra(wygraneGraczaLewego, wygraneGraczaPrawego, ile_paletek, 80);
  } else if(N === '6'){
    mnoznik = 1.2;
    nowaGra(wygraneGraczaLewego, wygraneGraczaPrawego, ile_paletek, 64);
  } else if (N === '7') {
    nowaGra(wygraneGraczaLewego, wygraneGraczaPrawego, ile_paletek, szerokosc_paletek); //restart gry bez zmiany poprzednich ustawień
  } // ...
}
function losowaPredkoscWLosowymKierunku(maksymalnaPredkosc) {
  wynik = Math.round((Math.random() * 2 * maksymalnaPredkosc) - maksymalnaPredkosc);
  if (wynik === 0) {
    return losowaPredkoscWLosowymKierunku(maksymalnaPredkosc);
  }
  return wynik * mnoznik;
}
