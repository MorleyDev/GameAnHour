pushd src
	git clone https://github.com/behdad/box2d
	pushd box2d
		git checkout tags/v2.3.1
	popd
popd

pushd build
	mkdir debug-vs2017
	pushd debug-vs2017
		mkdir Box2D
		pushd Box2D
			cmake ..\..\..\src\box2d\Box2D -G"Visual Studio 15 2017 Win64" -DCMAKE_BUILD_TYPE=Debug -DBOX2D_BUILD_EXAMPLES=OFF
			cmake --build . --config debug
		popd
	popd

	mkdir release-vs2017
	pushd release-vs2017
		mkdir Box2D
		pushd Box2D
			cmake ..\..\..\src\box2d\Box2D -G"Visual Studio 15 2017 Win64" -DCMAKE_BUILD_TYPE=Release -DBOX2D_BUILD_EXAMPLES=OFF -DCMAKE_CXX_FLAGS_RELEASE="/MT"
			cmake --build . --config release
		popd
	popd
popd

xcopy src\Box2D\Box2D\Box2D\*.h .\include\Box2D\ /S /Y

xcopy build\debug-vs2017\Box2D\Box2D\Debug\*.lib .\lib\debug-vs2017\ /S /Y
xcopy build\debug-vs2017\Box2D\Box2D\Debug\*.pdb .\lib\debug-vs2017\ /S /Y
xcopy build\debug-vs2017\Box2D\Box2D\Debug\*.dll .\bin\debug-vs2017\ /S /Y
xcopy build\release-vs2017\Box2D\Box2D\Release\*.lib .\lib\release-vs2017\ /S /Y
xcopy build\release-vs2017\Box2D\Box2D\Release\*.dll .\bin\release-vs2017\ /S /Y
