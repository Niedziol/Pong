/**
 * Kod w tym pliku jest odpowiedzialny za dostarczenie mo¿liwoœci wypisywanie tekstu na ekranie
 */
function Screen(){
    this.screenElement = document.createElement('pre');
    this.screenElement.style="color:  white;";
}

Screen.prototype.log = function(wiadomosc){
  this.screenElement.innerHTML += wiadomosc + "\n";
};

Screen.prototype.clear = function(){
  this.screenElement.innerHTML = '';
};

Screen.prototype.embedd = function(){
    document.body.appendChild(this.screenElement);
};

var screen = new Screen();
screen.embedd();

var numerWpisu = 1;
function wypiszNaEkran(tekst) {
  maksymalnieLinii = 12;
  ileLiniiPozostawic = 2;
  if (screen.screenElement.innerHTML.split("\n").length > maksymalnieLinii) {
    screen.screenElement.innerHTML = screen.screenElement.innerHTML
        .split("\n").slice(maksymalnieLinii - ileLiniiPozostawic).join("\n"); 
  }
  screen.log("Wpis " + numerWpisu + ": " + tekst);
  numerWpisu++;
}

function usunWypisaneNapisy() {
  screen.clear();
}

