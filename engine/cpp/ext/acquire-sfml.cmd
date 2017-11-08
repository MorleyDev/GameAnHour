pushd src
	git clone https://github.com/SFML/SFML
	pushd SFML
		git checkout tags/2.4.2
	popd
popd

pushd build
	mkdir debug
	pushd debug
		mkdir SFML
		pushd SFML
			cmake ..\..\..\src\SFML -G"MinGW Makefiles" -DCMAKE_BUILD_TYPE=Debug
			cmake --build . --config debug
		popd
	popd

	mkdir release
	pushd release
		mkdir SFML
		pushd SFML
			cmake ..\..\..\src\SFML -G"MinGW Makefiles" -DCMAKE_BUILD_TYPE=Release
			cmake --build . --config release
		popd
	popd
popd

xcopy src\SFML\include .\include\ /S /Y
xcopy build\debug\SFML\lib\*.a .\lib\debug\ /S /Y
xcopy build\debug\SFML\lib\*.dll .\bin\debug\ /S /Y
xcopy build\release\SFML\lib\*.a .\lib\release\ /S /Y
xcopy build\release\SFML\lib\*.dll .\bin\release\ /S /Y
