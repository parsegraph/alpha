DIST_NAME = alpha

SCRIPT_FILES = \
	src/BlockIDs.js \
	src/index.ts \
	src/CubeMan.js \
	src/GLWidget.js \
	src/Physical.js \
	src/Maths.js \
	src/WeetPainter.js \
	src/Cam.js \
	src/glsl.d.ts \
	src/Input.js \
	src/Cluster.js \
	src/BlockStuff.js \
	src/WeetCubeWidget.js \
	src/FacePainter.js \
	src/demo.ts \
	test/test.ts

EXTRA_SCRIPTS = \
	src/WeetPainter_FragmentShader.glsl \
	src/WeetPainter_VertexShader.glsl

include ./Makefile.microproject
