pushd src
	git clone https://github.com/erincatto/Box2D
popd

pushd src
	pushd Box2D
		pushd Box2D
			premake5 vs2017
			pushd Build
				pushd vs2017
					msbuild Box2D.vcxproj /p:Configuration=Debug /p:Platform=x64
					msbuild Box2D.vcxproj /p:Configuration=Release /p:Platform=x64
				popd
			popd
		popd
	popd
popd

xcopy src\Box2D\Box2D\Box2D\*.h .\include\Box2D\ /S /Y
xcopy src\Box2D\Box2D\Build\vs2017\bin\Debug\*.lib .\lib\debug-vs2017\ /S /Y
xcopy src\Box2D\Box2D\Build\vs2017\bin\Debug\*.pdb .\lib\debug-vs2017\ /S /Y
xcopy src\Box2D\Box2D\Build\vs2017\bin\Release\*.lib .\lib\release-vs2017\ /S /Y
