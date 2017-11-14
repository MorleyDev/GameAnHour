mkdir build
pushd build
	mkdir release-vs2017x64
	pushd release-vs2017x64
		cmake ..\.. -G"Visual Studio 15 2017 Win64" -DCMAKE_BUILD_TYPE=Release
		cmake --build . --config release
	popd
popd

mkdir bin
pushd bin
	mkdir release-vs2017x64
	pushd release-vs2017x64
		xcopy ..\..\build\release-vs2017x64\Release\*.exe .\ /S /Y
		xcopy ..\..\ext\bin\release-vs2017x64\*.dll .\ /S /Y
	popd
popd
