pushd src
	git clone https://github.com/svaarala/duktape-releases duktape
	pushd duktape
		git checkout tags/v2.2.0
	popd
popd

pushd build
	mkdir debug-mingw32x64
	pushd debug-mingw32x64
		mkdir duktape
		pushd duktape
			gcc -c ..\..\..\src\duktape\src\duktape.c -o libduktape.a
		popd
	popd

	mkdir release-mingw32x64
	pushd release-mingw32x64
		mkdir duktape
		pushd duktape
			gcc -c ..\..\..\src\duktape\src\duktape.c -O3 -o libduktape.a
		popd
	popd
popd

xcopy src\duktape\src\*.h .\include\ /S /Y
xcopy src\duktape\src\*.json .\include\ /S /Y
xcopy build\debug-mingw32x64\duktape\*.a .\lib\debug-mingw32x64\ /S /Y
xcopy build\release-mingw32x64\duktape\*.a .\lib\release-mingw32x64\ /S /Y
