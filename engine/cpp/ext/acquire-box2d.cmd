pushd src
	git clone https://github.com/erincatto/Box2D
	pushd Box2D
		git checkout tags/v2.3.1
	popd
popd

pushd src
	pushd Box2D
		pushd Box2D
			premake4 gmake
			pushd Build
				pushd gmake
					mingw32-make Box2D config=debug
					mingw32-make Box2D config=release
				popd
			popd
		popd
	popd
popd

xcopy src\Box2D\Box2D\Box2D\*.h .\include\Box2D\ /S /Y
xcopy src\Box2D\Box2D\Build\gmake\bin\Debug\*.a .\lib\debug\ /S /Y
xcopy src\Box2D\Box2D\Build\gmake\bin\Release\*.a .\lib\release\ /S /Y
