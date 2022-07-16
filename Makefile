TP='/cygdrive/c/Program Files (x86)/CodeAndWeb/TexturePacker/bin/TexturePacker.exe'

.PHONY: deploy backup gen_assets release clean
release:
	rm -rf Release
	mkdir -p Release/audio
	cp -R Game/* Release
	cp -R Assets/audio/* Release/audio/
	
deploy: release minify
	(cd Release; scp -r * daniel@192.168.1.2:/Users/daniel/Web/apache-tomcat-5.5.28/webapps/games/proto/Agent386)
gen_assets:
	Tools/fnt2json/fnt2json.py Assets/fonts/04.fnt > Game/assets/fonts/04.json
	Tools/fntColorConvert/fntColorConvert.py Assets/fonts/04.png Game/assets/fonts/04.png
	$(TP) --sheet Game/assets/sprites/sprites.png --data Game/assets/sprites/sprites.json --format json --disable-rotation --trim-mode None Assets/sprites/*.png
	
	cp Assets/tiles/tilemap.png Game/assets/tiles/tilemap.png

gen_audio:
	echo "===== AUDIO ====="
	rm -rf Game/assets/audio
	mkdir -p Game/assets/audio/sounds
	cp Assets/audio/*.ogg Game/assets/audio

	for f in Assets/audio/sounds/*.wav; do \
		out=`basename $$f`; \
		out=$${out%.wav}.ogg; \
		oggenc -o Game/assets/audio/sounds/$$out $$f; \
	done

minify:
	(cd Release; node r.js -o baseUrl=js name=init out=min.js;)
	rm -rf Release/js/*.js Release/js/classes Release/r.js
	mv Release/min.js Release/js/init.js
backup: clean
	DATE=`date +"%d_%m_%Y_%H_%M"`
	zip -r Game_backup_$(shell date +"%d_%m_%Y_%H_%M").zip Makefile diary.txt Sandboxes Tools Assets Game
clean:
	rm -rf Release