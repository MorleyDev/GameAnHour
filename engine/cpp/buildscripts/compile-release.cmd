mkdir build
pushd build
	mkdir release
	pushd release
		cmake ..\.. -G"MinGW Makefiles" -DCMAKE_BUILD_TYPE=Release
		cmake --build . --config release
	popd
popd

mkdir bin
pushd bin
	mkdir release
	pushd release
		xcopy ..\..\build\release\*.exe .\
		xcopy ..\..\ext\bin\release\*.dll .\
	popd
popd
