all: index.html

index.html: homepage.html vertex-shader.vs fragment-shader.fs
	m4 homepage.html >index.html
