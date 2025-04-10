import * as THREE from "three";
import { blocks } from "../../blocks/blocks.js";

export class Physics {

    gravity = 10;

    constructor(scene) {
        this.helpers = new THREE.Group();
        scene.add(this.helpers);
    }
    
    pointIntersectionPlayer(playerPosition, player) {
        const dx = playerPosition.x - player.asset.object.position.x;
        const dy = playerPosition.y - (player.asset.object.position.y - (player.height / 2));
        const dz = playerPosition.z - player.asset.object.position.z;
        const r_sq = dx * dx + dz * dz;

        return (Math.abs(dy) < player.height / 2) && (r_sq < player.radius * player.radius);
    }

    lastPhase(collisions, player) {
        collisions.sort((a, b) => {
            return a.overlap < b.overlap;
        });

        for (const collision of collisions) {
            // for (const collision of collisions) {
            if (!this.pointIntersectionPlayer(collision.contactPoint, player)) continue;

            let deltaPosition = collision.normal.clone();
            deltaPosition.multiplyScalar(collision.overlap);
            player.asset.object.position.add(deltaPosition);
        }
    }

    secondPhase(candidates, player) {
        const collisions = [];

        for (const block of candidates) {
            const playerPosition = player.asset.object.position;
            const closestPoint = {
                x: Math.max(block.x - 0.5, Math.min(playerPosition.x, block.x + 0.5)),
                y: Math.max(block.y - 0.5, Math.min(playerPosition.y - (player.height / 2), block.y + 0.5)),
                z: Math.max(block.z - 0.5, Math.min(playerPosition.z, block.z + 0.5)),
            };

            const dx = closestPoint.x - player.asset.object.position.x;
            const dy = closestPoint.y - (player.asset.object.position.y - (player.height / 2));
            const dz = closestPoint.z - player.asset.object.position.z;

            if (this.pointIntersectionPlayer(closestPoint, player)) {
                const overlapY = (player.height / 2) - Math.abs(dy);
                const overlapXZ = player.radius - Math.sqrt(dx * dx + dz * dz);

                let normal, overlap;
                if (overlapY < overlapXZ) {
                    normal = new THREE.Vector3(0, -Math.sign(dy), 0);
                    overlap = overlapY;
                } else {
                    normal = new THREE.Vector3(-dx, 0, -dz).normalize();
                    overlap = overlapXZ;
                }

                collisions.push({
                    block,
                    contactPoint: closestPoint,
                    normal,
                    overlap
                });
            }
        }

        return collisions;
    }

    firstPhase(player, world) {

        if (!player.asset.object) {
            console.log("erro broadPhase: player não carregado.");
            return;
        }

        const candidates = [];

        const positionDifference = {
            x: {
                min: Math.floor(player.asset.object.position.x - player.radius),
                max: Math.ceil(player.asset.object.position.x + player.radius)
            },
            y: {
                min: Math.floor(player.asset.object.position.y - player.height),
                max: Math.ceil(player.asset.object.position.y)
            },
            z: {
                min: Math.floor(player.asset.object.position.z - player.radius),
                max: Math.ceil(player.asset.object.position.z + player.radius)
            }
        }

        for (let x = positionDifference.x.min; x <= positionDifference.x.max; x++) {
            for (let y = positionDifference.y.min; y <= positionDifference.y.max; y++) {
                for (let z = positionDifference.z.min; z <= positionDifference.z.max; z++) {
                    const block = world.getBlock(x, y, z);
                    if (block && block.id !== blocks.empty.id) {
                        const block = { x, y, z };
                        candidates.push(block);
                    }
                }
            }
        }
        return candidates;
    }

    detectCollisions(player, world) {
        const candidates = this.firstPhase(player, world);
        const collisions = this.secondPhase(candidates, player);

        if (collisions.length > 0) {
            this.lastPhase(collisions, player);
        }
    }

    update(player, world) {
        this.helpers.clear();
        player.updateBoundsHelper();
        this.detectCollisions(player, world);
    }
}