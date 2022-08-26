/* ******************************************************************
 * Constantes de configuration
 * ****************************************************************** */
const apiKey = "783e3900-5e5c-4eb2-96b1-09116a02d793"; //"69617e9b-19db-4bf7-a33f-18d4e90ccab7";
const serverUrl = "https://lifap5.univ-lyon1.fr";

/* ******************************************************************
 * Gestion de la boîte de dialogue (a.k.a. modal) d'affichage de
 * l'utilisateur.
 * ****************************************************************** */

/**
 * Fait une requête GET authentifiée sur /whoami
 * @returns une promesse du login utilisateur ou du message d'erreur
 */
function fetchWhoami(API) {
    return fetch(serverUrl + "/whoami", { headers: { "Api-Key": API } })
        .then((response) => {
            if (response.status === 401) {
                return response.json().then((json) => {
                    console.log(json);
                    return { err: json.message };
                });
            } else {
                return response.json();
            }
        })
        .catch((erreur) => ({ err: erreur }));
}

function fetchPokemons() {
    return fetch(serverUrl + "/pokemon")
        .then((response) => {
            if (response.status === 401) {
                return response.json().then((json) => {
                    console.log(json);
                    return { err: json.message };
                });
            } else {
                return response.json();
            }
        })
        .catch((erreur) => ({ err: erreur }));
}



/**
 * Fait une requête sur le serveur et insère le login dans la modale d'affichage
 * de l'utilisateur puis déclenche l'affichage de cette modale.
 *
 * @param {Etat} etatCourant l'état courant
 * @returns Une promesse de mise à jour
 */
function lanceWhoamiEtInsereLogin(API, etatCourant) {
    return fetchWhoami(API).then((data) => {
        majEtatEtPage(etatCourant, {
            login: data.user, // qui vaut undefined en cas d'erreur
            errLogin: data.err, // qui vaut undefined si tout va bien
            loginModal: false, // on ferme la modale
        });
    });
}

/**
 * Génère le code HTML du corps de la modale de login. On renvoie en plus un
 * objet callbacks vide pour faire comme les autres fonctions de génération,
 * mais ce n'est pas obligatoire ici.
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et un objet vide
 * dans le champ callbacks
 */
function genereModaleLoginBody(etatCourant) {
    const text =
        `<span style="font-weight: bold">Clé d'API :<span>
        <br/>
        <input id="apikey" type="password" size="50">`;
    return {
        html: `
  <section class="modal-card-body">
    <p>${text}</p>
  </section>
  `,
        callbacks: {},
    };
}


/**
 * Génère le code HTML du titre de la modale de login et les callbacks associés.
 *
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function genereModaleLoginHeader(etatCourant) {
    return {
        html: `
<header class="modal-card-head  is-back">
  <p class="modal-card-title">Utilisateur</p>
  <button
    id="btn-close-login-modal1"
    class="delete"
    aria-label="close"
    ></button>
</header>`,
        callbacks: {
            "btn-close-login-modal1": {
                onclick: () => majEtatEtPage(etatCourant, { loginModal: false }),
            },
        },
    };
}

/**
 * Génère le code HTML du base de page de la modale de login et les callbacks associés.
 *
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function genereModaleLoginFooter(etatCourant) {
    return {
        html: `
  <footer class="modal-card-foot" style="justify-content: flex-end">
    <button id="btn-close-login-modal2" class="button">Fermer</button>
    <button id="btn-valid-login-modal" class="button">Valider</button>
  </footer>
  `,
        callbacks: {
            "btn-valid-login-modal": {
                onclick: () => {
                    lanceWhoamiEtInsereLogin(
                        document.getElementById("apikey").value, etatCourant)
                }
            },
            "btn-close-login-modal2": {
                onclick: () => majEtatEtPage(etatCourant, { loginModal: false }),
            },
        },
    };
}


/**
 * Génère le code HTML de la modale de login et les callbacks associés.
 *
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function genereModaleLogin(etatCourant) {
    const header = genereModaleLoginHeader(etatCourant);
    const footer = genereModaleLoginFooter(etatCourant);
    const body = genereModaleLoginBody(etatCourant);
    const activeClass = etatCourant.loginModal ? "is-active" : "is-inactive";
    return {
        html: `
      <div id="mdl-login" class="modal ${activeClass}">
        <div class="modal-background"></div>
        <div class="modal-card">
          ${header.html}
          ${body.html}
          ${footer.html}
        </div>
      </div>`,
        callbacks: {...header.callbacks, ...footer.callbacks, ...body.callbacks },
    };
}

/* ************************************************************************
 * Gestion de barre de navigation contenant en particulier les bouton Pokedex,
 * Combat et Connexion.
 * ****************************************************************** */

/**
 * Déclenche la mise à jour de la page en changeant l'état courant pour que la
 * modale de login soit affichée
 * @param {Etat} etatCourant
 */
function afficheModaleConnexion(etatCourant) {
    majEtatEtPage(etatCourant, { loginModal: true });
}

/**
 * Génère le code HTML et les callbacks pour la partie droite de la barre de
 * navigation qui contient le bouton de login.
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function genereBoutonConnexion(etatCourant) {
    const html = `
  <div class="navbar-end">
    <div class="navbar-item">
      <div class="buttons">
        ${etatCourant.login === undefined ?
        `<a id="btn-open-login-modal" class="button is-light"> Connexion </a>`:
        `<p>${etatCourant.login}</p>
        <a id="btn-disconnect-login" class="button is-light"> Déconnexion </a>`
    }
      </div>
    </div>
  </div>`;
    return {
        html: html,
        callbacks: callbackConnexion(etatCourant).callbacks,
        };
}

function callbackConnexion(etatCourant){
    return {
        html:"",
        callbacks: {
            "btn-open-login-modal": {
                onclick: () => afficheModaleConnexion(etatCourant),
            },
            "btn-disconnect-login":{
                onclick: () => majEtatEtPage(etatCourant, {login: undefined}),
            }
        },
    }
}

/**
 * Génère le code HTML de la barre de navigation et les callbacks associés.
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function genereBarreNavigation(etatCourant) {
    const connexion = genereBoutonConnexion(etatCourant);
    return {
        html: `
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar">
      <div class="navbar-item"><div class="buttons">
          <a id="btn-pokedex" class="button is-light"> Pokedex </a>
          <a id="btn-combat" class="button is-light"> Combat </a>
      </div></div>
      ${connexion.html}
    </div>
  </nav>`,
        callbacks: {
            ...connexion.callbacks,
            "btn-pokedex": { onclick: () => console.log("click bouton pokedex") },
        },
    };
}

/**
 * Génére le code HTML de la page ainsi que l'ensemble des callbacks à
 * enregistrer sur les éléments de cette page.
 *
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function generePage(etatCourant) {
    const barredeNavigation = genereBarreNavigation(etatCourant);
    const modaleLogin = genereModaleLogin(etatCourant);
    const listePokemon = genereTabPokemon(etatCourant);
    const boutonsLimite = generePlusMoins(etatCourant);
    const selectedPokemon = etatCourant.selected !==undefined?
     genereSelectedPokemon(etatCourant):'';
    const tri = callbackTri(etatCourant);
    return {
        html: barredeNavigation.html + modaleLogin.html + listePokemon.html
        + selectedPokemon.html + boutonsLimite.html ,
        callbacks: {...barredeNavigation.callbacks, ...modaleLogin.callbacks,
        ...listePokemon.callbacks, ...boutonsLimite.callbacks, ...tri.callbacks },
    };
}
// remarquer l'usage de la notation ... ci-dessous qui permet de "fusionner"
    // les dictionnaires de callbacks qui viennent de la barre et de la modale.
    // Attention, les callbacks définis dans modaleLogin.callbacks vont écraser
    // ceux définis sur les mêmes éléments dans barredeNavigation.callbacks. En
    // pratique ce cas ne doit pas se produire car barreDeNavigation et
    // modaleLogin portent sur des zone différentes de la page et n'ont pas
    // d'éléments en commun.

/* ******************************************************************
 * Initialisation de la page et fonction de mise à jour
 * globale de la page.
 * ****************************************************************** */

/**
 * Créée un nouvel état basé sur les champs de l'ancien état, mais en prenant en
 * compte les nouvelles valeurs indiquées dans champsMisAJour, puis déclenche la
 * mise à jour de la page et des événements avec le nouvel état.
 *
 * @param {Etat} etatCourant etat avant la mise à jour
 * @param {*} champsMisAJour objet contenant les champs à mettre à jour, ainsi
 * que leur (nouvelle) valeur.
 */
function majEtatEtPage(etatCourant, champsMisAJour) {
    const nouvelEtat = {...etatCourant, ...champsMisAJour };
    majPage(nouvelEtat);
}

/**
 * Prend une structure décrivant les callbacks à enregistrer et effectue les
 * affectation sur les bon champs "on...". Par exemple si callbacks contient la
 * structure suivante où f1, f2 et f3 sont des callbacks:
 *
 * { "btn-pokedex": { "onclick": f1 },
 *   "input-search": { "onchange": f2,
 *                     "oninput": f3 }
 * }
 *
 * alors cette fonction rangera f1 dans le champ "onclick" de l'élément dont
 * l'id est "btn-pokedex", rangera f2 dans le champ "onchange" de l'élément dont
 * l'id est "input-search" et rangera f3 dans le champ "oninput" de ce même
 * élément. Cela aura, entre autres, pour effet de délclencher un appel à f1
 * lorsque l'on cliquera sur le bouton "btn-pokedex".
 *
 * @param {Object} callbacks dictionnaire associant les id d'éléments à un
 * dictionnaire qui associe des champs "on..." aux callbacks désirés.
 */
function enregistreCallbacks(callbacks) {
    Object.keys(callbacks).forEach((id) => {
        const elt = document.getElementById(id);
        if (elt === undefined || elt === null) {
            console.log(
                `Élément inconnu: ${id}, impossible d'enregistrer de callback sur cet id`
            );
        } else {
            Object.keys(callbacks[id]).forEach((onAction) => {
                elt[onAction] = callbacks[id][onAction];
            });
        }
    });
}

/**
 * Mets à jour la page (contenu et événements) en fonction d'un nouvel état.
 *
 * @param {Etat} etatCourant l'état courant
 */
function majPage(etatCourant) {
    console.log("CALL majPage");
    const page = generePage(etatCourant);
    document.getElementById("root").innerHTML = page.html;
    enregistreCallbacks(page.callbacks);
}


/**
 * Appelé après le chargement de la page.
 * Met en place la mécanique de gestion des événements
 * en lançant la mise à jour de la page à partir d'un état initial.
 */
function initClientPokemons() {
    console.log("CALL initClientPokemons");
    const etatInitial = {
        loginModal: false,
        login: undefined,
        errLogin: undefined,
    };
    recuperePokemon(etatInitial);
    console.log(etatInitial);
}

// Appel de la fonction init_client_duels au après chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    console.log("Exécution du code après chargement de la page");
    initClientPokemons();
});

function recuperePokemon(etatCourant) {
    return fetchPokemons()
        .then((json) => majEtatEtPage(etatCourant, {
            pokemon: json,
            selected: json[0],
            nombre: 10,
            tri: 1,
            sens: 0,
        }));
}

function genereTabLignePokemon(n, etatCourant) {
    return `<tr id="${n.PokedexNumber}" 
    class="${genereIsSelected(n, etatCourant)}">
    <td>
        <img alt="${n.Name}" src="${n.Images.Detail}" width="64" />
    </td>
    <td>
        <div class="content">${n.PokedexNumber}</div>
    </td>
    <td>
        <div class="content">${n.Name}</div>
    </td>
    <td>
        <ul> ${n.Abilities.map((a) => `<li> ${a} </li>`).join('\n')}</ul>
    </td>
    <td>
        <ul>${n.Types.map((a) => `<li> ${a} </li>`).join('\n')}</ul>
    </td>
    </tr>`;
    
}

function triId(sens, pokemon){
    return (sens % 2 === 1 ?
        pokemon.sort((a, b) => a.PokedexNumber < b.PokedexNumber):
        pokemon.sort((a, b) => a.PokedexNumber > b.PokedexNumber));
}

function triName(sens, pokemon){
    return (sens % 2 === 1 ?
        pokemon.sort((a, b) => a.Name < b.Name):
        pokemon.sort((a, b) => a.Name > b.Name));
}

function triAbilities(sens, pokemon){
    return (sens % 2 === 1 ?
        pokemon.sort((a, b) => a.Abilities[0] < b.Abilities[0]):
        pokemon.sort((a, b) => a.Abilities[0] > b.Abilities[0]));
}

function triTypes(sens, pokemon){
    return (sens % 2 === 1 ?
        pokemon.sort((a, b) => a.Types[0] < b.Types[0]):
        pokemon.sort((a, b) => a.Types[0] > b.Types[0]));
}

function tri(type, sens, pokemon){
    switch(type){
        case 1: return triId(sens, pokemon);
            break;
        case 2: return triName(sens, pokemon);
            break;
        case 3: return triAbilities(sens, pokemon);
            break;
        case 4: return triTypes(sens, pokemon);
            break;
        default:
            break;
    };
}

function genereIsSelected(pokemon, etatCourant){
    return (pokemon === etatCourant.selected) ? "is-selected" : '';
}

function genereTabPokemon(etatCourant) {
    const html = tri(etatCourant.tri, etatCourant.sens, etatCourant.pokemon)
        .slice(0, etatCourant.nombre)
        .map((n) => genereTabLignePokemon(n, etatCourant)).join('');
    const ligneGenerees = etatCourant.pokemon.slice(0, etatCourant.nombre)
    .map((n) => callbackIsSelected(n, etatCourant));
    console.log(etatCourant);
    return {
        html: generePokedex(etatCourant, html),
        callbacks:ligneGenerees.reduce( (acc,l) => ( {...acc, ...l }), {}),
    };
}

function generePokeOuDeck(){
    return`
        <div class="column">
            <div class="tabs is-centered">
                <ul>
                    <li class="is-active" id="tab-all-pokemons">
                        <a>Tous les pokemons</a>
                    </li>
                    <li id="tab-tout"><a>Mes pokemons</a></li>
                </ul>
            </div>`;
}

function genereTabHeader(etatCourant){
    const asc_desc = etatCourant.sens % 2 !== 1 ?
    `<i class="fas fa-angle-up">` : `<i class="fas fa-angle-down">`;
    return`<thead><tr>
        <th><span>Image</span></th>
        <th id="tri-id">
            <span>#</span>
            <span class="icon">${etatCourant.tri === 1?asc_desc:''}</i></span>
        </th>
        <th id="tri-name"><span>Name</span>
            <span class="icon">${etatCourant.tri === 2?asc_desc:''}</i></span>
        </th>
        <th id="tri-abilities"><span>Abilities</span>
            <span class="icon">${etatCourant.tri === 3?asc_desc:''}</i></span>
        </th>
        <th id="tri-types"><span>Types</span>
        <span class="icon">${etatCourant.tri === 4?asc_desc:''}</i></span>
        </th>
        </tr>
    </thead>`;
}

function generePokedex(etatCourant, tableau){
    return generePokeOuDeck() + `
    <div class ="columns">
    <div class="column">
    <div id="tbl-pokemons">
    <table class="table">
      ${genereTabHeader(etatCourant)} </tbody>`+ tableau +
    `</tbody></table>
    </div> </div>`;
}

function genereBtnPlusMoins(){
    return `
    <form>
    <button id="btn-moins" class="button is-light" type="button">Moins</button>
    <button id="btn-plus" class="button is-light" type="button">Plus</button>
    </form>`;
    
}

function generePlusMoins(etatCourant){
    const callbacks = {
        "btn-moins":{
            onclick: () => etatCourant.nombre > 10 ? 
            majEtatEtPage(etatCourant, {nombre: etatCourant.nombre - 10}):
            ''
        },
        "btn-plus":{
            onclick: () => majEtatEtPage(etatCourant, 
                {nombre: etatCourant.nombre + 10})
        }
    }
    return{
        html: genereBtnPlusMoins(),
        callbacks: callbacks,
    };
}

function callbackIsSelected(pokemon, etatCourant){
    const callback = {};
    callback[`${pokemon.PokedexNumber}`] = {
        "onclick": () => majEtatEtPage(etatCourant, {selected: pokemon}),
    };
    return callback;

}

function genereSelectedPokemon(etatCourant){
    const pokemon = etatCourant.selected;
    const str_against = Object.keys(pokemon.Against);
    const str_res = str_against.filter((n) => pokemon.Against[n] < 1);
    const str_weak = str_against.filter((n) => pokemon.Against[n] > 1);
    const html = `<div class="column">
    <div class="card" >` +
    genereCardHeader(pokemon) +
    `<div class="card-content">` +
    genereCardContent(pokemon, str_res, str_weak) + 
    genereCardImage(pokemon) +
    ( etatCourant.login !== undefined ? genereCardFooter(pokemon): '') +`
    </div>
    </div>
    </div>
    </div></div>
    `
    return {html:html};
}

function genereCardHeader(pokemon){
    const html = `<div class="card-header">
    <div class="card-header-title">
    ${pokemon.JapaneseName} (#${pokemon.PokedexNumber})</div>
    </div>
    <div class="card-content">
        <article class="media">
            <div class="media-content">
                <h1 class="title">${pokemon.Name}</h1>
            </div>
        </article>
    </div>`;
return html;
}

function genereCardContent(pokemon, str_res, str_weak){
    const html = `<article class="media">
        <div class="media-content">
            <div class="content has-text-left">
                <p>Hit points: ${pokemon.Hp}</p>
            <h3>Abilities</h3>
            <ul>${pokemon.Abilities
                .map((n) => `<li>${n}</li>`).join('\n')}</ul>
            <h3>Resistant against</h3>
            <ul>${str_res
                .map((n) => `<li>${n}</li>`).join('\n')}</ul>
            <h3>Weak against</h3>
            <ul> ${str_weak
                .map((n) => `<li>${n}</li>`).join('\n')}</ul></ul>
            </div>
        </div>`;
    return html;
}

function genereCardImage(pokemon){
    const html = `
        <figure class="media-right">
            <figure class="image is-475x475">
                <img class="" src="${pokemon.Images.Full}" alt="${pokemon.Name}" />
            </figure>
        </figure>
        </article>`;
    return html;
}


function genereCardFooter(pokemon){
    return `<div class="card-footer">
    <article class="media">
        <div class="media-content">
            <button class="is-success button" tabindex="0">
                Ajouter à mon deck
            </button>
        </div>
    </article>
</div>`;
}

function callbackTri(etatCourant){
    return{
        html:"",
        callbacks:{
            "tri-id":{onclick: () => majEtatEtPage(etatCourant, {
                tri: 1, sens: etatCourant.sens + 1
            })},
            "tri-name":{onclick: () => majEtatEtPage(etatCourant, {
                tri: 2, sens: etatCourant.sens + 1
            })},
            "tri-abilities":{onclick: () => majEtatEtPage(etatCourant, {
                tri: 3, sens: etatCourant.sens + 1
            })},
            "tri-types":{onclick: () => majEtatEtPage(etatCourant, {
                tri: 4, sens: etatCourant.sens + 1
            })}
        },
    }
}