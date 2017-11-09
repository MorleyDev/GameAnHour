pushd src
	git clone https://github.com/behdad/box2d
	pushd box2d
		git checkout tags/v2.3.1
	popd
popd

pushd build
	mkdir debug-mingw32
	pushd debug-mingw32
		mkdir Box2D
		pushd Box2D
			cmake ..\..\..\src\box2d\Box2D -G"MinGW Makefiles" -DCMAKE_BUILD_TYPE=Debug -DBOX2D_BUILD_EXAMPLES=OFF
			cmake --build . --config debug
		popd
	popd

	mkdir release-mingw32
	pushd release-mingw32
		mkdir Box2D
		pushd Box2D
			cmake ..\..\..\src\box2d\Box2D -G"MinGW Makefiles" -DCMAKE_BUILD_TYPE=Release -DBOX2D_BUILD_EXAMPLES=OFF
			cmake --build . --config release
		popd
	popd
popd

xcopy src\Box2D\Box2D\Box2D\*.h .\include\Box2D\ /S /Y

xcopy build\debug-mingw32\Box2D\Box2D\Debug\*.lib .\lib\debug-mingw32\ /S /Y
xcopy build\debug-mingw32\Box2D\Box2D\Debug\*.pdb .\lib\debug-mingw32\ /S /Y
xcopy build\debug-mingw32\Box2D\Box2D\Debug\*.dll .\bin\debug-mingw32\ /S /Y
xcopy build\release-mingw32\Box2D\Box2D\Release\*.lib .\lib\release-mingw32\ /S /Y
xcopy build\release-mingw32\Box2D\Box2D\Release\*.dll .\bin\release-mingw32\ /S /Y
