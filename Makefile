ll: dest/index.html dest/index.js

dest/index.html: src/homepage.html src/vertex-shader.vs src/fragment-shader.fs
	m4 src/homepage.html >dest/index.html

dest/index.js: src/homepage.js
	cp src/homepage.js dest/index.js
