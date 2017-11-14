pushd src
	git clone https://github.com/behdad/box2d
	pushd box2d
		git checkout tags/v2.3.1
	popd
popd

pushd build
	mkdir debug-mingw32x64
	pushd debug-mingw32x64
		mkdir Box2D
		pushd Box2D
			cmake ..\..\..\src\box2d\Box2D -G"MinGW Makefiles" -DCMAKE_BUILD_TYPE=Debug -DBOX2D_BUILD_EXAMPLES=OFF
			cmake --build . --config debug
		popd
	popd

	mkdir release-mingw32x64
	pushd release-mingw32x64
		mkdir Box2D
		pushd Box2D
			cmake ..\..\..\src\box2d\Box2D -G"MinGW Makefiles" -DCMAKE_BUILD_TYPE=Release -DBOX2D_BUILD_EXAMPLES=OFF
			cmake --build . --config release
		popd
	popd
popd

xcopy src\Box2D\Box2D\Box2D\*.h .\include\Box2D\ /S /Y

xcopy build\debug-mingw32x64\Box2D\Box2D\*.a .\lib\debug-mingw32x64\ /S /Y
xcopy build\debug-mingw32x64\Box2D\Box2D\*.dll .\bin\debug-mingw32x64\ /S /Y
xcopy build\release-mingw32x64\Box2D\Box2D\*.a .\lib\release-mingw32x64\ /S /Y
xcopy build\release-mingw32x64\Box2D\Box2D\*.dll .\bin\release-mingw32x64\ /S /Y
