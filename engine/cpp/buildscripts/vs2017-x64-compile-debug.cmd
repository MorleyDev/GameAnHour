mkdir build
pushd build
	mkdir debug-vs2017x64
	pushd debug-vs2017x64
		cmake ..\.. -G"Visual Studio 15 2017 Win64" -DCMAKE_BUILD_TYPE=Debug
		cmake --build . --config debug
	popd
popd

mkdir bin
pushd bin
	mkdir debug-vs2017x64
	pushd debug-vs2017x64
		xcopy ..\..\build\debug-vs2017x64\Debug\*.exe .\ /S /Y
		xcopy ..\..\ext\bin\debug-vs2017x64\*.dll .\ /S /Y
	popd
popd
