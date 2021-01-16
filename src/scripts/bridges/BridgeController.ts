///<reference path="./BridgeLocation.ts"/>

class BridgeController {

    /**
     * The current opened bridge
     */
    public static bridge: KnockoutObservable<BridgeLocation> = ko.observable(BridgeLocation.Skyarrow_Bridge);

    public static visible: KnockoutObservable<boolean> = ko.observable(false);

    public static bridgeData: Record<BridgeLocation, Bridge>;

    /**
     * Initializes static data for the BridgeController
     */
    public static initialize() {
        this.bridgeData  = {
            [BridgeLocation.Skyarrow_Bridge]: new Bridge(BridgeLocation.Skyarrow_Bridge, 'Skyarrow Bridge'),
            [BridgeLocation.Driftveil_Drawbridge]: new Bridge(BridgeLocation.Driftveil_Drawbridge, 'Driftveil Drawbridge'),
            [BridgeLocation.Tubeline_Bridge]: new Bridge(BridgeLocation.Tubeline_Bridge, 'Tubeline Bridge'),
            [BridgeLocation.Village_Bridge]: new Bridge(BridgeLocation.Village_Bridge, 'Village Bridge'),
            [BridgeLocation.Marvelous_Bridge]: new Bridge(BridgeLocation.Marvelous_Bridge, 'Marvelous Bridge'),
            [BridgeLocation.Marine_Tube]: new Bridge(BridgeLocation.Marine_Tube, 'Marine Tube'),
        };
    }

    /**
     * Handles initializing the bridge modal
     */
    private static startup() {
        this.startAddingPokemon();
    }

    /**
     * Resets the bridge data
     */
    private static reset() {
        this.stopAddingPokemon();
        // Clear out old pokemon
        $('.bridgePokemon').remove();
    }

    // Add a pokemon to the scene
    private static addPokemon() {
        // Generating Pokemon
        const pokemon = this.bridgeData[this.bridge()].generatePokemon();
        const shiny = !Math.floor(Math.random() * GameConstants.SHINY_CHANCE_BREEDING);

        const pokeElement = this.generatePokemonElement(pokemon, shiny);

        document.getElementById('bridgeContainer').appendChild(pokeElement);
        setTimeout(() => {
            document.getElementById('bridgeContainer').removeChild(pokeElement);
        }, GameConstants.MINUTE);
    }

    private static generatePokemonElement(pokemon, shiny): HTMLDivElement {
        const pokeElement = document.createElement('div');
        pokeElement.style.bottom = `${Math.floor(Math.random() * 70) + 20}vh`;
        pokeElement.style.backgroundImage = `${shiny ? 'url(\'assets/images/dynamic-background/pokemon/sparkle.png\'), ' : ''}url('assets/images/dynamic-background/pokemon/${pokemon.toString().padStart(3, 0)}${shiny ? 's' : ''}.png')`;
        pokeElement.classList.add('bridgePokemon');
        pokeElement.classList.add('pokemonSprite');
        pokeElement.classList.add('walkLeft');
        pokeElement.classList.add('moveLeft');
        pokeElement.setAttribute('data-pokemonID', pokemon);
        pokeElement.setAttribute('data-shiny', shiny);
        pokeElement.onclick = function(this) {
            // Getting data
            const pokemonData = $(this).data();
            // Sanity Check
            if (pokemonData.hasOwnProperty('pokemonID')) {
                // Obtaining Pokemon
                // TODO: HLXII - Add notification specific for bridge
                App.game.party.gainPokemonById(pokemonData.pokemonID, pokemonData.shiny);
            }

            // Removing pokemon from DOM
            $(this).remove();
        };
        return pokeElement;
    }

    /* SCENE MANAGEMENT */
    private static addPokemonTimeout: NodeJS.Timeout;

    private static startAddingPokemon() {
        // Random delay up to 10 seconds
        const delay = Math.floor(Math.random() * (10 * GameConstants.SECOND));

        // Assign our timeout function so we can stop it later
        this.addPokemonTimeout = setTimeout(() => {
            // Add Pokemon
            this.addPokemon();

            // Start up new timeout
            this.startAddingPokemon();
        }, delay);
    }

    private static stopAddingPokemon() {
        clearTimeout(this.addPokemonTimeout);
    }

    public static enterBridge(bridge: BridgeLocation) {
        this.visible(true);
        this.bridge(bridge);
        this.startup();
        $('#bridgeModal').modal('show');
    }

    public static leaveBridge() {
        this.visible(false);
        this.reset();
    }

}

document.addEventListener('DOMContentLoaded', () => {
    // Handle bridge modal closing
    $('#bridgeModal').on('hidden.bs.modal', () => {
        BridgeController.leaveBridge();
    });
});
