pushd src
	git clone https://github.com/SFML/SFML
	pushd SFML
		git checkout tags/2.4.2
	popd
popd

pushd build
	mkdir debug-vs2017
	pushd debug-vs2017
		mkdir SFML
		pushd SFML
			cmake ..\..\..\src\SFML -G"Visual Studio 15 2017 Win64" -DCMAKE_BUILD_TYPE=Debug
			cmake --build . --config debug
		popd
	popd

	mkdir release-vs2017
	pushd release-vs2017
		mkdir SFML
		pushd SFML
			cmake ..\..\..\src\SFML -G"Visual Studio 15 2017 Win64" -DCMAKE_BUILD_TYPE=Release -DSFML_USE_STATIC_STD_LIBS=1 -DBUILD_SHARED_LIBS=FALSE
			cmake --build . --config release
		popd
	popd
popd

xcopy src\SFML\include .\include\ /S /Y
xcopy build\debug-vs2017\SFML\lib\Debug\*.lib .\lib\debug-vs2017\ /S /Y
xcopy build\debug-vs2017\SFML\lib\Debug\*.pdb .\lib\debug-vs2017\ /S /Y
xcopy build\debug-vs2017\SFML\lib\Debug\*.dll .\bin\debug-vs2017\ /S /Y
xcopy build\release-vs2017\SFML\lib\Release\*.lib .\lib\release-vs2017\ /S /Y
xcopy build\release-vs2017\SFML\lib\Release\*.dll .\bin\release-vs2017\ /S /Y
