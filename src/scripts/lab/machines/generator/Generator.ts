/// <reference path="../Machine.ts" />
/// <reference path="../MachineState.ts" />
/// <reference path="./GeneratorFuel.ts" />
/**
 * The Generator will increase the speed of machines when placed in the Lab.
 */
class Generator extends Machine {

    constructor(id: Lab.Machine, name: string, description: string, width: number, height: number) {
        super(id, name, description, width, height);
    }

    createState(json?: any): MachineState {
        const state = new GeneratorState();
        state.fromJSON(json);
        return state;
    }

    // TODO: HLXII - Balance fuelAmounts
    // TODO: HLXII - Add Research Upgrades for fuel
    /**
     * Possible Fuels that can be used in the Generator
     */
    public static fuelTypes: GeneratorFuel[];
    public static initialize() {
        this.fuelTypes = [
            new GeneratorFuel(GeneratorFuelType.electric_shard, PokemonType.Electric, ItemType.shard, 0.1, Lab.Research.generator_fuel),
            new GeneratorFuel(GeneratorFuelType.zap_plate, 'Zap Plate', ItemType.underground, 10, Lab.Research.generator_fuel_zap_plate),
            new GeneratorFuel(GeneratorFuelType.wacan_berry, BerryType.Wacan, ItemType.berry, 0.2, Lab.Research.generator_fuel_wacan),
            new GeneratorFuel(GeneratorFuelType.thunder_stone, 'Thunder_stone', ItemType.item, 20, Lab.Research.generator_fuel_thunder_stone),
            new GeneratorFuel(GeneratorFuelType.electirizer, 'Electirizer', ItemType.item, 25, Lab.Research.generator_fuel_electirizer),
        ];
    }

    public static getAvailableFuels(): GeneratorFuel[] {
        return this.fuelTypes.filter(fuel => !fuel.research || App.game.lab.isResearched(fuel.research));
    }

    // TODO: HLXII - Add Research Upgrades
    /**
     * Determines the max fuel that can be added to the Generator.
     * Dependent on Research Upgrades
     */
    public static fuelCapacity: KnockoutComputed<number> = ko.pureComputed(() => {
        return 100;
    });

    // TODO: HLXII - Add Research Upgrades
    /**
     * Determines the total base multiplier this Generator will produce.
     * Dependent on Research Upgrades
     */
    public static baseEffect: KnockoutComputed<number> = ko.pureComputed(() => {
        return 1.05;
    });

}

class GeneratorState extends MachineState {

    private _fuel: KnockoutObservable<number>;

    public effect: KnockoutComputed<number>;

    constructor() {
        super();

        this._fuel = ko.observable(0);

        this.tooltip = ko.pureComputed(() => {
            const tooltip = [];
            if (this.active) {
                tooltip.push(`Increasing Machine speed by ${this.effect().toFixed(2)}x.`);
            } else {
                tooltip.push('Disabled');
            }
            if (this.fuel <= 0) {
                tooltip.push('No fuel remaining');
            } else {
                tooltip.push(`${this.fuel.toFixed(1)} fuel remaining.`);
            }
            return tooltip.join('<br>');
        });

        this.effect = ko.pureComputed(() => {
            let multiplier = Generator.baseEffect();
            if (this.stage === MachineStage.active) {
                // TODO: HLXII - Update number? or dependent on Research Upgrades?
                multiplier *= 1.5;
            }
            return multiplier;
        });
    }

    update(delta: number) {
        switch (this.stage) {
            case MachineStage.disabled: {
                return;
            }
            case MachineStage.idle: {
                if (this.fuel) {
                    this.stage = MachineStage.active;
                }
                return;
            }
            case MachineStage.active: {
                this.fuel = Math.max(this.fuel - delta, 0);
                // Run out of fuel
                if (this.fuel == 0) {
                    this.stage = MachineStage.idle;
                }
                return;
            }
        }
    }

    handleActivate(): void {
        if (this.fuel > 0) {
            this.stage = MachineStage.active;
        } else {
            this.stage = MachineStage.idle;
        }
    }
    handleDeactivate(): void {
        this.stage = MachineStage.disabled;
    }

    toJSON(): Record<string, any> {
        const json = super.toJSON();
        json['fuel'] = this.fuel;
        return json;
    }
    fromJSON(json: Record<string, any>): void {
        super.fromJSON(json);
        if (!json) {
            this.fuel = 0;
        } else {
            this.fuel = json.hasOwnProperty('fuel') ? json['fuel'] : 0;
        }
    }

    get fuel(): number {
        return this._fuel();
    }

    set fuel(fuel: number) {
        this._fuel(fuel);
    }

}