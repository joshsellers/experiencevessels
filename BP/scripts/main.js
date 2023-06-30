import { world } from "@minecraft/server"
import * as UI from "@minecraft/server-ui"

world.afterEvents.dataDrivenEntityTriggerEvent.subscribe((event) => {
    if (event.id == "stoex:interact_event") {
        var player;

        const players = world.getAllPlayers();
        for (let i in players) {
            let p = players[i];
            const entities = p.getEntitiesFromViewDirection();
            for (let j in entities) {
                let entity = entities[j];
                if (entity.id == event.entity.id) {
                    player = p;
                    break;
                }
            }

            if (player != undefined) break;
        }


        const vessel = event.entity;

        var storedLevels = 0;
        vessel.getTags().forEach((tag) => {
            if (tag.includes("STOREDXP")) {
                storedLevels = parseInt(tag.split(":")[1]);
            }
        });

        const playerCurrentLevel = player.level;

        let modal = new UI.ModalFormData()
            .title(`Storing §2${storedLevels}§r level${storedLevels == 1 ? '' : 's'}`)
            .slider("Deposit amount", 0, playerCurrentLevel, 1, 0)
            .slider("Withdrawal amount", 0, storedLevels, 1, 0)
            .show(player).then((response) => {
                if (response.formValues != undefined) {
                    const depositAmount = response.formValues[0];
                    const withdrawalAmount = response.formValues[1];

                    if (depositAmount > 0) {
                        player.addLevels(-depositAmount);
                        storedLevels += depositAmount;
                    }

                    if (withdrawalAmount > 0) {
                        player.addLevels(withdrawalAmount);
                        storedLevels -= withdrawalAmount;
                    }

                    vessel.getTags().forEach((tag) => {
                        if (tag.includes("STOREDXP")) {
                            vessel.removeTag(tag);
                        }
                    });

                    vessel.addTag(`STOREDXP:${storedLevels}`);
                }
            });
    }
});

world.afterEvents.entityDie.subscribe((event) => {
    if (event.deadEntity.typeId == "stoex:experience_vessel" && event.damageSource.damagingEntity.level != undefined) {
        event.deadEntity.getTags().forEach((tag) => {
            if (tag.includes("STOREDXP")) {
                const levels = parseInt(tag.split(":")[1]);
                event.damageSource.damagingEntity.addLevels(levels);
            }
        });
    }
});

function log(message) {
    world.getAllPlayers().forEach((player) => {
        player.sendMessage(message);
    });
}