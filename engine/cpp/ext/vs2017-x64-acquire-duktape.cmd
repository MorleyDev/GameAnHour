pushd src
	git clone https://github.com/svaarala/duktape-releases duktape
	pushd duktape
		git checkout tags/v2.2.0
	popd
popd

pushd build
	mkdir debug-vs2017x64
	pushd debug-vs2017x64
		mkdir duktape
		pushd duktape
			cl /c /Z7 ..\..\..\src\duktape\src\duktape.c
			lib duktape.obj
		popd
	popd

	mkdir release-vs2017x64
	pushd release-vs2017x64
		mkdir duktape
		pushd duktape
			cl /c /O2 ..\..\..\src\duktape\src\duktape.c
			lib duktape.obj
		popd
	popd
popd

xcopy src\duktape\src\*.h .\include\ /S /Y
xcopy src\duktape\src\*.json .\include\ /S /Y
xcopy build\debug-vs2017x64\duktape\*.lib .\lib\debug-vs2017x64\ /S /Y
xcopy build\release-vs2017x64\duktape\*.lib .\lib\release-vs2017x64\ /S /Y
