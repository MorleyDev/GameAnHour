mkdir build
pushd build
	mkdir release-mingw32x64
	pushd release-mingw32x64
		cmake ..\.. -G"MinGW Makefiles" -DCMAKE_BUILD_TYPE=Release
		cmake --build . --config release
	popd
popd

mkdir bin
pushd bin
	mkdir release-mingw32x64
	pushd release-mingw32x64
		xcopy ..\..\build\release-mingw32x64\*.exe .\ /S /Y
		xcopy ..\..\ext\bin\release-mingw32x64\*.dll .\ /S /Y
	popd
popd
