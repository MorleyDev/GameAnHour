pushd src
	git clone https://github.com/SFML/SFML
	pushd SFML
		git checkout tags/2.4.2
	popd
popd

pushd build
	mkdir debug-mingw32x64
	pushd debug-mingw32x64
		mkdir SFML
		pushd SFML
			cmake ..\..\..\src\SFML -G"MinGW Makefiles" -DCMAKE_BUILD_TYPE=Debug
			cmake --build . --config debug
		popd
	popd

	mkdir release-mingw32x64
	pushd release-mingw32x64
		mkdir SFML
		pushd SFML
			cmake ..\..\..\src\SFML -G"MinGW Makefiles" -DCMAKE_BUILD_TYPE=Release
			cmake --build . --config release
		popd
	popd
popd

xcopy src\SFML\include .\include\ /S /Y

xcopy build\debug-mingw32x64\SFML\lib\*.a .\lib\debug-mingw32x64\ /S /Y
xcopy build\debug-mingw32x64\SFML\lib\*.dll .\bin\debug-mingw32x64\ /S /Y

xcopy build\release-mingw32x64\SFML\lib\*.a .\lib\release-mingw32x64\ /S /Y
xcopy build\release-mingw32x64\SFML\lib\*.dll .\bin\release-mingw32x64\ /S /Y

xcopy src\SFML\extlibs\bin\x64\*.dll .\bin\debug-mingw32x64\ /S /Y
xcopy src\SFML\extlibs\bin\x64\*.dll .\bin\release-mingw32x64\ /S /Y
