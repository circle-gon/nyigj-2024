import { jsx } from "features/feature";
import type { BaseLayer, GenericLayer } from "game/layers";
import { createLayer } from "game/layers";
import type { Player } from "game/player";
import { computed } from "vue";
import { renderGrid } from "util/vue";
import { createAdditiveModifier, createSequentialModifier } from "game/modifiers";
import { createUpgrade } from "features/upgrades/upgrade";
import { createResource } from "features/resources/resource";
import { createCostRequirement } from "game/requirements";
import { noPersist } from "game/persistence";
import Decimal, { DecimalSource, format, formatWhole } from "util/bignum";
import "./style.css";
import MainDisplayVue from "features/resources/MainDisplay.vue";

/**
 * @hidden
 */

const brown = "brown";

export const main = createLayer("main", function (this: BaseLayer) {
    const wood = createResource<DecimalSource>(0, "wood");

    const boxLengthModifier = createSequentialModifier(() => [
        createAdditiveModifier(() => ({
            addend: 1,
            description: "Make a Box",
            enabled: () => makeTheBox.bought.value
        }))
    ]);

    const boxWidthModifier = createSequentialModifier(() => [
        createAdditiveModifier(() => ({
            addend: 1,
            description: "Make a Box",
            enabled: () => makeTheBox.bought.value
        }))
    ]);

    const boxHeightModifier = createSequentialModifier(() => [
        createAdditiveModifier(() => ({
            addend: 1,
            description: "Make a Box",
            enabled: () => makeTheBox.bought.value
        }))
    ]);

    const boxWidth = computed(() => boxWidthModifier.apply(0));
    const boxLength = computed(() => boxLengthModifier.apply(0));
    const boxHeight = computed(() => boxHeightModifier.apply(0));

    const makeTheBox = createUpgrade(() => ({
        requirements: createCostRequirement(() => ({
            resource: noPersist(wood),
            cost: 0
        })),
        display: {
            title: "Make a Box",
            description: "Unlock the box."
        }
    }));

    const doubler = createUpgrade(() => ({
        requirements: createCostRequirement(() => ({
            resource: noPersist(wood),
            cost: 0
        })),
        display: {
            title: "Bigger Box",
            description: "Double the dimensions of the box."
        }
    }));

    const upgrades = [[makeTheBox, doubler]];

    const prod = computed(() => Decimal.mul(boxWidth.value, boxLength.value).mul(boxHeight.value));

    return {
        name: "Main",
        wood,
        upgrades,
        display: jsx(() => (
            <>
                <MainDisplayVue resource={wood} color={brown} />

                {makeTheBox.bought.value ? (
                    <>
                        The box is currently {formatWhole(boxWidth.value)}
                        <span class="small"> x </span>
                        {formatWhole(boxLength.value)}
                        <span class="small"> x </span>
                        {formatWhole(boxHeight.value)}, giving {format(prod.value)} wood per second.
                        <br />
                    </>
                ) : null}

                <br />
                <br />
                {renderGrid(...upgrades)}
            </>
        ))
    };
});

/**
 * Given a player save data object being loaded, return a list of layers that should currently be enabled.
 * If your project does not use dynamic layers, this should just return all layers.
 */
export const getInitialLayers = (
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    player: Partial<Player>
): Array<GenericLayer> => [main];

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
