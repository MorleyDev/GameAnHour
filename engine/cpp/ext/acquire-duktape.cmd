pushd src
	git clone https://github.com/svaarala/duktape-releases duktape
	pushd duktape
		git checkout tags/v2.2.0
	popd
popd

pushd build
	mkdir debug
	pushd debug
		mkdir duktape
		pushd duktape
			gcc -c ..\..\..\src\duktape\src\duktape.c -o libduktape.a
		popd
	popd

	mkdir release
	pushd release
		mkdir duktape
		pushd duktape
			gcc -c ..\..\..\src\duktape\src\duktape.c -O3 -o libduktape.a
		popd
	popd
popd

xcopy src\duktape\src\*.h .\include\ /S /Y
xcopy src\duktape\src\*.json .\include\ /S /Y
xcopy build\debug\duktape\*.a .\lib\debug\ /S /Y
xcopy build\release\duktape\*.a .\lib\release\ /S /Y
