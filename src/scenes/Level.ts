// You can write more code here

/* START OF COMPILED CODE */

import Phaser from "phaser";
import TileMapLayerPhysics from "../components/TileMapLayerPhysics";
import Player from "../prefabs/Player";
import Enemy from "../prefabs/Enemy";
import FollowTarget from "../components/FollowTarget";
import PSD from "../prefabs/PSD";
import Rock from "../prefabs/Rock";
/* START-USER-IMPORTS */
import DepthSortY from "../components/DepthSortY";
import { DIRECTION } from "../types/direction";
import Bullet from "../prefabs/Bullet";
import JustMovement from "../components/JustMovement";
import SelectionSquare from "../components/SelectionSquare";
import KeyboardInput from "../components/KeyboardInput";
import { PSD_STATE } from "../types/PSD";
import eventsCenter from "../EventsCenter";
import { SCENE_SWITCH_EVENTS } from "../types/scenes";
import { ENEMY_STATE_KEYS } from "../types/enemyStateKeys";
import psdField from "../prefabs/psdField";
import DetectionBoxes from "../components/DetectionBoxes";
/* END-USER-IMPORTS */

export default class Level extends Phaser.Scene {

	constructor() {
		super("Level");

		/* START-USER-CTR-CODE */
		// Write your code here.

		/* END-USER-CTR-CODE */
	}

	editorCreate(): void {

		// cave_test_map_2
		const cave_test_map_2 = this.add.tilemap("cave-test-map-2");
		cave_test_map_2.addTilesetImage("gamedevjs-cave-tileset-1", "cave-test-tileset-1");

		// floor_1
		const floor_1 = cave_test_map_2.createLayer("floor", ["gamedevjs-cave-tileset-1"], 0, -960);

		// wall_1
		const wall_1 = cave_test_map_2.createLayer("wall", ["gamedevjs-cave-tileset-1"], 0, -960);

		// player
		const player = new Player(this, 160, 160);
		this.add.existing(player);

		// enemyA
		const enemyA = new Enemy(this, 160, 352);
		this.add.existing(enemyA);

		// pSDRobot
		const pSDRobot = new PSD(this, -200, 0);
		this.add.existing(pSDRobot);
		pSDRobot.name = "pSDRobot";

		// start_level
		const start_level = this.add.sprite(144, 160, "Start-Level-Anim-Short-20");

		// rock_1
		const rock_1 = new Rock(this, 64, 272);
		this.add.existing(rock_1);

		// rock
		const rock = new Rock(this, 160, 240);
		this.add.existing(rock);

		// rock_2
		const rock_2 = new Rock(this, 128, 272);
		this.add.existing(rock_2);

		// rock_3
		const rock_3 = new Rock(this, 96, 272);
		this.add.existing(rock_3);

		// rock_4
		const rock_4 = new Rock(this, 192, 240);
		this.add.existing(rock_4);

		// lists
		const enemyTeam = [enemyA];
		const obstacles = [rock_1, rock_3, rock_2, rock, rock_4];

		// wall_1 (components)
		new TileMapLayerPhysics(wall_1);

		// enemyA (components)
		const enemyAFollowTarget = FollowTarget.getComponent(enemyA);
		enemyAFollowTarget.target = player;
		enemyAFollowTarget.range = 100;
		enemyAFollowTarget.deadRangeX = 35;

		this.floor_1 = floor_1;
		this.wall_1 = wall_1;
		this.player = player;
		this.enemyA = enemyA;
		this.pSDRobot = pSDRobot;
		this.start_level = start_level;
		this.rock_1 = rock_1;
		this.rock = rock;
		this.cave_test_map_2 = cave_test_map_2;
		this.enemyTeam = enemyTeam;
		this.obstacles = obstacles;

		this.events.emit("scene-awake");
	}

	private floor_1!: Phaser.Tilemaps.TilemapLayer;
	private wall_1!: Phaser.Tilemaps.TilemapLayer;
	public player!: Player;
	private enemyA!: Enemy;
	private pSDRobot!: PSD;
	private start_level!: Phaser.GameObjects.Sprite;
	private rock_1!: Rock;
	private rock!: Rock;
	private enemyTeam!: Enemy[];
	private obstacles!: Rock[];

	/* START-USER-CODE */
	public platformer_fun!: Phaser.Tilemaps.Tilemap
	cave_test_map_2!: Phaser.Tilemaps.Tilemap
	cave_test_map_1!: Phaser.Tilemaps.Tilemap
	// Write your code here
	bulletGroup!: Phaser.GameObjects.Group
	lastfired = 0
	#destination!: SelectionSquare

	create() {

		this.editorCreate();

		this.player.play('player-front-idle')
		this.floor_1.depth = this.wall_1.y * 2
		this.wall_1.depth = this.wall_1.y * 2

		// this.wall_1.setCollisionByProperty({collides: true})

		this.initObjectPool()

		this.physics.add.collider(this.player, this.wall_1);
		// this.physics.add.collider(this.player, this.enemyTeam)
		this.physics.add.collider(this.enemyTeam, this.enemyTeam)
		this.physics.add.collider(this.enemyTeam, this.wall_1)
		this.physics.add.collider(this.bulletGroup, this.wall_1, this.handleBulletWallCollision, undefined, this)
		this.physics.add.overlap(this.bulletGroup, this.enemyTeam, this.handleBulletSwarm, undefined, this)
		this.physics.add.collider(this.enemyTeam, this.obstacles)
		// this.setDetectOverlap(this.enemyTeam[0])

		this.#destination = SelectionSquare.getComponent(this.player)

		this.events.on('create-bullet', this.handleBulletUpdate, this)
		this.events.on('deploy-PSD', this.deployPSD, this)
		this.events.on('takeback-PSD', this.takeBackPSD, this)
		this.events.on('gen-psd-field', this.addColliderEnemyField, this)

		if(process.env.NODE_ENV !== "development")
		{
			this.start_level.once('animationcomplete', () => {
				this.events.once('resume', this.onStartLevelAnimsComplete, this)
				eventsCenter.emit(SCENE_SWITCH_EVENTS.TO_EXPLAINER)
			}, this)
			this.enemyTeam.forEach(e => {
				FollowTarget.getComponent(e).deactivate()
			})

			this.player.setVisible(false)
			this.playStartLevelAnims()

		}

		// bypass if environment is in development
		this.start_level.setVisible(false).setActive(false)
		this.onStartLevelAnimsComplete()
		/* this.time.addEvent({
			repeat: 3,
			delay: 1000,
			callback: this.createMoreSwarm,
			callbackScope: this,
		}) */
	}

	update(time: number, delta: number)
	{
		this.handleDepthSort()
		// this.showSelectionSquare()
	}

	getCollidingBlocks()
	{
		return {
			wall: this.wall_1,
			rocks: this.obstacles,
			group: this.enemyTeam
		}
	}

	private setDetectOverlap(enemy: Enemy)
	{
		const zones = DetectionBoxes.getComponent(enemy).getDetectionZones()
		const upzone = zones[DIRECTION.BACK]
		const leftzone = zones[DIRECTION.LEFT]
		const rightzone = zones[DIRECTION.RIGHT]
		// only set up zone overlap
		this.physics.add.overlap(upzone, this.obstacles, () => {
			const checkLeft = this.wall_1.hasTileAtWorldXY(leftzone.getBounds().left, leftzone.getBounds().centerY)
			const checkRight =  this.wall_1.hasTileAtWorldXY(rightzone.getBounds().right, rightzone.getBounds().centerY)
			if(checkLeft)
			{
				enemy.emit('move', DIRECTION.RIGHT)
			}
			else if(checkRight)
			{
				enemy.emit('move', DIRECTION.LEFT)
			}
			else
			{
				const choice = [DIRECTION.LEFT, DIRECTION.RIGHT]
				const choose = choice[Phaser.Math.Between(0, 1)]
				enemy.emit('move', choose)
			}

			this.time.delayedCall(600, () => {
				enemy.emit('move', DIRECTION.BACK)
			})
		},
		() => {
			return enemy.direction === DIRECTION.BACK
		},
		this)
	}

	/**
	 * Spawns more swarm that goes
	 */
	private createMoreSwarm()
	{
		const spawnX = [80, 128, 160, 192, 240]
		const spawnY = 416
		for(let i = 0; i < spawnX.length; i++)
		{
			const enemy = new Enemy(this, spawnX[i], spawnY)
			this.add.existing(enemy)
			const follow = FollowTarget.getComponent(enemy);
			follow.range = 300
			follow.deadRangeX = 35
			this.enemyTeam.push(enemy)
		}
		console.log(this.enemyTeam)
	}

	private addColliderEnemyField()
	{
		if(!this.pSDRobot.outerField || !this.pSDRobot.innerField)
		{
			return
		}
		this.physics.add.collider(this.enemyTeam, this.pSDRobot.outerField.getAll(), this.handleEnemyFieldCollides, undefined, this)
		this.physics.add.collider(this.enemyTeam, this.pSDRobot.innerField.getAll(), this.handleEnemyFieldCollides, undefined, this)
	}

	//@ts-ignore
	private handleEnemyFieldCollides(e, f)
	{
		// enemy enrages
		const enemy = e as Enemy
		const field = f as Phaser.Physics.Arcade.Image
		const fieldCon = field.parentContainer as psdField
		const follow = FollowTarget.getComponent(enemy)
		follow.deactivate()
		enemy.enrage()

		let ty = 4
		const t = this.tweens.create({
			targets: enemy,
			duration: 100,
			onStart: () => {
				enemy.setSMState(ENEMY_STATE_KEYS.IDLE)
				const b = enemy.body as Phaser.Physics.Arcade.Body
				b.setVelocity(ty)
			},
			onComplete: () => {
				enemy.setSMState(ENEMY_STATE_KEYS.WALK)
			}
		})


		fieldCon.damage(enemy.attack)
		this.time.delayedCall(500, () => {
			if(field.y < enemy.y)
			{
				ty = 4
				t.play()
			}
			else if(field.y > enemy.y)
			{
				ty = -4
				t.play()
			}
		})
	}

	//@ts-ignore
	private enrageEnemy(enemy, field)
	{
		const e = enemy as Enemy
		const follow = FollowTarget.getComponent(e)
		follow.deactivate()
		e.enrage()
	}

	private onStartLevelAnimsComplete()
	{
		if(this.player)
		{
			this.player.setVisible(true)
		}

		const input = KeyboardInput.getComponent(this.player)
		if(!input)
		{
			return
		}
		input.setActive(true)
		this.enemyTeam.forEach(e => {
			FollowTarget.getComponent(e).activate()
		})
	}

	private handleBulletSwarm(a: Phaser.Types.Physics.Arcade.GameObjectWithBody, b: Phaser.Types.Physics.Arcade.GameObjectWithBody)
	{
		const bullet = a as Bullet
		const enemy = b as Enemy
		bullet.despawn()
		enemy.despawn()
	}

	private playStartLevelAnims()
	{
		this.player.setVisible(false)
		this.start_level.play('start-level-short')
	}

	private deployPSD()
	{
		const destination = SelectionSquare.getComponent(this.player)
		if(!destination)
		{
			console.error(`selection square is undefined`)
			return
		}

		const {x, y} = destination.getSelectionSquare()
		if(this.cave_test_map_2.hasTileAtWorldXY(x, y, this.cameras.main, this.wall_1))
		{
			// revert psd comp state back to idle
			this.player.setPSDCompState(PSD_STATE.EQIUP_IDLE)
			return
		}
		console.log('psd spawn')
		this.pSDRobot.spawn(x, y)
		this.pSDRobot.deploy()
	}

	private takeBackPSD()
	{
		if(!this.checkSelectionPSDOverlap())
		{
			return
		}

		this.pSDRobot.returnToPlayer()
		this.player.emit('player-recover-psd')
		this.enemyTeam.forEach(e => {
			FollowTarget.getComponent(e).activate()
		})
	}

	private checkSelectionPSDOverlap()
	{
		if(!this.#destination)
		{
			console.error(`selection square is undefined`)
			return
		}

		const checkRect = this.#destination.getSelectionSquare().getBounds()
		const PSDRect = this.pSDRobot.getBounds()

		return Phaser.Geom.Intersects.RectangleToRectangle(checkRect, PSDRect)
	}


	private handleBulletUpdate(dir: number)
	{
		const bullet = this.bulletGroup.get()

		const delay = 500

		if(bullet && this.time.now > this.lastfired)
		{
			bullet.fire(this.player.x, this.player.y)

			this.setBulletRotationAndVel(bullet, dir)
			// console.log('bullet', bullet.x, bullet.y)

			this.lastfired = this.time.now + delay
		}
	}

	private initObjectPool()
	{
		this.bulletGroup = this.add.group({
			classType: Bullet,
			maxSize: 50,
			runChildUpdate: true
		})
	}

	//@ts-ignore
	private handleBulletWallCollision(b , w)
	{
		const bullet = b as Bullet
		bullet.despawn()
	}

	private setBulletRotationAndVel(bul: Bullet, dir: number)
	{
		const bulMovement = JustMovement.getComponent(bul)
		if(!bulMovement){ return }

		switch(dir)
		{
			case DIRECTION.LEFT: {
				bul.angle = 0
				bulMovement.moveLeft()
				break
			}

			case DIRECTION.RIGHT: {
				bul.angle = 180
				bulMovement.moveRight()
				break
			}

			case DIRECTION.BACK: {
				bul.angle = 90
				bulMovement.moveUp()
				break
			}

			case DIRECTION.FRONT: {
				bul.angle = 270
				bulMovement.moveDown()
				break
			}
		}
	}

	private handlePause()
	{
		this.scene.pause('Level')
		this.scene.launch('Pause')
	}

	private layerDebug(layer: Phaser.Tilemaps.TilemapLayer)
	{
		const debugGraphics = this.add.graphics().setAlpha(0.75);
		layer.renderDebug(debugGraphics, {
			tileColor: null, // Color of non-colliding tiles
			collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
			faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
		});
	}

	private handleDepthSort()
	{
		this.children.each(c => {
			const child = c as Phaser.GameObjects.Sprite;

			if(!DepthSortY.getComponent(child))
			{
				return
			}

			child.setDepth(child.y)
		})
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here