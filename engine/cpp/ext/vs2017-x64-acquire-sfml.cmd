pushd src
	git clone https://github.com/SFML/SFML
	pushd SFML
		git checkout tags/2.4.2
	popd
popd

pushd build
	mkdir debug-vs2017x64
	pushd debug-vs2017x64
		mkdir SFML
		pushd SFML
			cmake ..\..\..\src\SFML -G"Visual Studio 15 2017 Win64" -DCMAKE_BUILD_TYPE=Debug
			cmake --build . --config debug
		popd
	popd

	mkdir release-vs2017x64
	pushd release-vs2017x64
		mkdir SFML
		pushd SFML
			cmake ..\..\..\src\SFML -G"Visual Studio 15 2017 Win64" -DCMAKE_BUILD_TYPE=Release -DSFML_USE_STATIC_STD_LIBS=1 -DBUILD_SHARED_LIBS=FALSE
			cmake --build . --config release
		popd
	popd
popd

xcopy src\SFML\include .\include\ /S /Y

xcopy build\debug-vs2017x64\SFML\lib\Debug\*.lib .\lib\debug-vs2017x64\ /S /Y
xcopy build\debug-vs2017x64\SFML\lib\Debug\*.pdb .\lib\debug-vs2017x64\ /S /Y
xcopy build\debug-vs2017x64\SFML\lib\Debug\*.dll .\bin\debug-vs2017x64\ /S /Y

xcopy build\release-vs2017x64\SFML\lib\Release\*.lib .\lib\release-vs2017x64\ /S /Y
xcopy build\release-vs2017x64\SFML\lib\Release\*.dll .\bin\release-vs2017x64\ /S /Y

xcopy src\SFML\extlibs\libs-msvc-universal\x64\*.lib .\lib\release-vs2017x64\ /S /Y
xcopy src\SFML\extlibs\bin\x64\*.dll .\bin\debug-vs2017x64\ /S /Y
xcopy src\SFML\extlibs\bin\x64\*.dll .\bin\release-vs2017x64\ /S /Y
