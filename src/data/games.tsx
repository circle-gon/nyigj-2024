import { jsx } from "features/feature";
import type { BaseLayer } from "game/layers";
import { createLayer } from "game/layers";
import { noPersist, persistent } from "game/persistence";
import { createBar } from "features/bars/bar";
import { computed, ref } from "vue";
import type { Ref } from "vue";
import { Direction } from "util/common";
import { render } from "util/vue";
import { globalBus } from "game/events";
import { formatWhole, format } from "util/bignum";

type FromArray<T> = T extends (infer S)[] ? S : T;

export default createLayer("games", function (this: BaseLayer) {
    const doingAction = persistent<string>("", false);
    function createSubpart<T extends object>(
        options: {
            name: string;
            action: string;
            color: string;
            data: (progress: number) => string[];
            can?: () => boolean;
            gain: () => number;
            uses: Ref<number>;
        } & T
    ) {
        const { name, action, data, color, can = () => true, gain, uses, ...others } = options;
        const progress = persistent<number>(0);

        const dataComputed = computed(() => data(progress.value));
        const canComputed = computed(() => can() && uses.value > 0);
        const gainComputed = computed(() => gain());

        const bar = createBar(() => ({
            width: 100,
            height: 30,
            direction: Direction.Right,
            progress: () => progress.value % 1,
            display: () =>
                doingAction.value === name ? `${format(gainComputed.value)}/s` : action,
            textStyle: {
                color
            },
            baseStyle: {
                "background-color": "grey"
            }
        }));

        function onClick() {
            if (canComputed.value) {
                doingAction.value = name;
            }
        }

        return {
            name,
            progress,
            gain: gainComputed,
            uses: noPersist(uses),
            can: canComputed,
            ...others,
            display: jsx(() => (
                <div class="box" style={{ "border-color": color }}>
                    <div style={{ width: "100%" }}>
                        <span class="big-header">{name}</span>
                        <br />
                        <hr />
                    </div>
                    <div style={{ "font-size": "10px" }}>
                        {dataComputed.value.map(i => (
                            <div>{i}</div>
                        ))}
                    </div>
                    <div onClick={onClick}>{render(bar)}</div>
                </div>
            ))
        };
    }

    function formatFloor(value: number) {
        return formatWhole(Math.floor(value));
    }

    const ideaPart = createSubpart({
        name: "Ideas",
        action: "Think",
        data: ideas => [`${formatFloor(ideas)} ideas`],
        color: "blue",
        gain: () => 1,
        spend: computed(() => 0),
        // A dummy one
        uses: ref(1)
    });

    const featurePart = createSubpart({
        name: "Features",
        action: "Create",
        data: features => [`${formatFloor(features)} features`, "Ideas -> Features"],
        color: "pink",
        gain: () => 1,
        spend: computed(() => 1),
        uses: ideaPart.progress
    });

    const programmingPart = createSubpart({
        name: "Programming",
        action: "Program",
        data: lines => [`${formatFloor(lines)} lines of code`, "Features -> Lines of Code"],
        color: "green",
        gain: () => 1,
        spend: computed(() => 1),
        uses: featurePart.progress
    });

    const mechanicPart = createSubpart({
        name: "Mechanics",
        action: "Modify",
        data: mechanics => [`${formatFloor(mechanics)} mechanics`, "Code -> Mechanics"],
        color: "orange",
        gain: () => 1,
        spend: computed(() => 1),
        uses: programmingPart.progress
    });

    const all = [ideaPart, featurePart, programmingPart, mechanicPart];

    globalBus.on("update", diff => {
        const feature = all.find(i => i.name === doingAction.value);
        if (feature !== undefined && feature.can.value) {
            const used = Math.min(diff, feature.uses.value / feature.spend.value);

            feature.progress.value += feature.gain.value * used;
            feature.uses.value -= feature.spend.value * used;
        }
    });

    return {
        name: "Games",
        doingAction,
        all,
        display: jsx(() => <div class="contain">{all.map(i => render(i.display))}</div>)
    };
});
