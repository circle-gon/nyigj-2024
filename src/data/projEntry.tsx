import { jsx } from "features/feature";
import type { BaseLayer, GenericLayer } from "game/layers";
import { createLayer } from "game/layers";
import type { Player } from "game/player";
import { computed } from "vue";
import { createBar } from "features/bars/bar";
import { Direction } from "util/common";
import { render } from "util/vue";
import { format } from "util/bignum";
import { createTabFamily } from "features/tabs/tabFamily";
import { createTab } from "features/tabs/tab";
import games from "./games";
import "./style.css";

/**
 * @hidden
 */
export const main = createLayer("main", function (this: BaseLayer) {
    const pressure = computed(() => 10)
    const maxPressure = computed(() => 100);

    const pressureBar = createBar(() => ({
        width: 400,
        height: 50,
        direction: Direction.Right,
        progress: () => pressure.value / maxPressure.value,
        display: jsx(() => 
        <> 
        <span style={{color: "red"}}>{format(pressure.value)}</span> / {format(maxPressure.value)} Pressure
        </>),
        fillStyle: {
            "background-color": "grey"
        }
    }))

    const tabs = createTabFamily({
        games: () => ({
            tab: createTab(() => ({
                display: games.display
            })),
            display: "Games"
        })
    })

    return {
        name: "Main",
        display: jsx(() => (
            <>
                {render(pressureBar)}
                {render(tabs)}
            </>
        )),
        tabs
    };
});

/**
 * Given a player save data object being loaded, return a list of layers that should currently be enabled.
 * If your project does not use dynamic layers, this should just return all layers.
 */
export const getInitialLayers = (
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    player: Partial<Player>
): Array<GenericLayer> => [main, games];

/**
 * A computed ref whose value is true whenever the game is over.
 */
export const hasWon = computed(() => {
    return false;
});

/**
 * Given a player save data object being loaded with a different version, update the save data object to match the structure of the current version.
 * @param oldVersion The version of the save being loaded in
 * @param player The save data being loaded in
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export function fixOldSave(
    oldVersion: string | undefined,
    player: Partial<Player>
    // eslint-disable-next-line @typescript-eslint/no-empty-function
): void {}
/* eslint-enable @typescript-eslint/no-unused-vars */
