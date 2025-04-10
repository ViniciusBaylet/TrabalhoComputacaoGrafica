import * as THREE from "three";
import { blocks } from "../../blocks/blocks.js";

export class Physics {

    gravity = 10;

    constructor(scene) {
        this.scene = scene;
    }

    pointIntersectionPlayer(playerPosition, player) {
        const dx = playerPosition.x - player.position.x;
        const dy = playerPosition.y - (player.position.y - (player.height / 2));
        const dz = playerPosition.z - player.position.z;
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

            let offset = collision.normal.clone();
            offset.multiplyScalar(collision.overlap);
            player.position.add(offset);
        }
    }

    secondPhase(candidates, player) {
        const collisions = [];

        for (const block of candidates) {
            const playerPosition = player.position;
            const closestPoint = {
                x: Math.max(block.x - 0.5, Math.min(playerPosition.x, block.x + 0.5)),
                y: Math.max(block.y - 0.5, Math.min(playerPosition.y - (player.height / 2), block.y + 0.5)),
                z: Math.max(block.z - 0.5, Math.min(playerPosition.z, block.z + 0.5)),
            };

            const dx = closestPoint.x - player.position.x;
            const dy = closestPoint.y - (player.position.y - (player.height / 2));
            const dz = closestPoint.z - player.position.z;

            if (this.pointIntersectionPlayer(closestPoint, player)) {
                const overlapY = (player.height / 2) - Math.abs(dy);
                const overlapXZ = player.radius - Math.sqrt(dx * dx + dz * dz);

                let normal, overlap;
                if (overlapY < overlapXZ) {
                    normal = new THREE.Vector3(0, -Math.sign(dy), 0);
                    overlap = overlapY;
                    player.onGround = true;
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
        const candidates = [];

        const positionDifference = {
            x: {
                min: Math.floor(player.position.x - player.radius),
                max: Math.ceil(player.position.x + player.radius)
            },
            y: {
                min: Math.floor(player.position.y - player.height),
                max: Math.ceil(player.position.y)
            },
            z: {
                min: Math.floor(player.position.z - player.radius),
                max: Math.ceil(player.position.z + player.radius)
            }
        }

        for (let x = positionDifference.x.min; x <= positionDifference.x.max; x++) {
            for (let y = positionDifference.y.min; y <= positionDifference.y.max; y++) {
                for (let z = positionDifference.z.min; z <= positionDifference.z.max; z++) {
                    const block = world.getBlock(x, y, z);
                    if (block && block.id !== blocks.empty.id && block.id !== blocks.water.id) {
                        candidates.push({ ...block, x, y, z });
                    }
                }
            }
        }
        return candidates;
    }

    detectCollisions(player, world) {
        player.onGround = false;
        const candidates = this.firstPhase(player, world);
        const collisions = this.secondPhase(candidates, player);

        if (collisions.length > 0) {
            this.lastPhase(collisions, player);
        }
    }

    update(dt, player, world) {
        player.updateBoundsHelper();
        player.addVelocity(dt);
        this.detectCollisions(player, world);
    }
}