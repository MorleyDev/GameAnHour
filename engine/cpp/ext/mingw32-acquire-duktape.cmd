pushd src
	git clone https://github.com/svaarala/duktape-releases duktape
	pushd duktape
		git checkout tags/v2.2.0
	popd
popd

pushd build
	mkdir debug-mingw32
	pushd debug-mingw32
		mkdir duktape
		pushd duktape
			gcc -c ..\..\..\src\duktape\src\duktape.c -o libduktape.a
		popd
	popd

	mkdir release-mingw32
	pushd release-mingw32
		mkdir duktape
		pushd duktape
			gcc -c ..\..\..\src\duktape\src\duktape.c -O3 -o libduktape.a
		popd
	popd
popd

xcopy src\duktape\src\*.h .\include\ /S /Y
xcopy src\duktape\src\*.json .\include\ /S /Y
xcopy build\debug-mingw32\duktape\*.a .\lib\debug-mingw32\ /S /Y
xcopy build\release-mingw32\duktape\*.a .\lib\release-mingw32\ /S /Y
