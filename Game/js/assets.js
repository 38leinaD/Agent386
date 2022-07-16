/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {
    var AssetLoader = require('classes/AssetLoader');
    var audio = require('audio');

    var assets = new AssetLoader();
    assets.add('assets/fonts/04.json');
    assets.add('assets/fonts/04.png');

    assets.add('assets/tiles/tilemap.png');

    assets.add('assets/levels/intro.json');
    assets.add('assets/levels/chambers.json');
    assets.add('assets/levels/slime.json');
    assets.add('assets/levels/junction.json');
    assets.add('assets/levels/mansion.json');
    assets.add('assets/levels/construction.json');
    assets.add('assets/levels/skyscraper.json');
    assets.add('assets/levels/garden.json');
    assets.add('assets/levels/longrun.json');


    assets.add('assets/sprites/sprites.json');
    assets.add('assets/sprites/sprites.png');

    //assets.add('assets/sounds/test.ogg');

    if (audio.isSupported()) {
        assets.add('assets/audio/Edward_Shallow_-_01_-_Avalanche.ogg');
        //assets.add('assets/audio/Edward_Shallow_-_06_-_Hangnail.ogg');
        //assets.add('assets/audio/Buskerdroid_-_02_-_Gameboy_Love.ogg');
        //assets.add('assets/audio/Buskerdroid_-_01_-_Blast.ogg');
        //assets.add('assets/audio/RoccoW_-_Hello_Chiptune_Cover.ogg');

        assets.add('assets/audio/sounds/menu_clicked.ogg');
        assets.add('assets/audio/sounds/agent_gunshot.ogg');
        assets.add('assets/audio/sounds/agent_jump.ogg');
        assets.add('assets/audio/sounds/agent_hurt.ogg');
        assets.add('assets/audio/sounds/agent_pickup_floppy.ogg');
        assets.add('assets/audio/sounds/robot_turn.ogg');
        assets.add('assets/audio/sounds/laserturret_shot.ogg');
        assets.add('assets/audio/sounds/laserturret_hit.ogg');
        assets.add('assets/audio/sounds/flybot.ogg');
        assets.add('assets/audio/sounds/gameover.ogg');
        assets.add('assets/audio/sounds/explosion.ogg');
        assets.add('assets/audio/sounds/bombadier_release.ogg');
        assets.add('assets/audio/sounds/pick_up_health.ogg');
    }

    assets.load();

    return assets;
});