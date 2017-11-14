pushd src
	git clone https://github.com/Microsoft/ChakraCore.git
	pushd ChakraCore
		git checkout tags/v1.7.3
		msbuild /p:Platform=x64 /p:Configuration=Debug Build\Chakra.Core.sln
		msbuild /p:Platform=x64 /p:Configuration=Release /p:RuntimeLib=static_library Build\Chakra.Core.sln
	popd
popd

xcopy src\ChakraCore\lib\Jsrt\ChakraCore.h .\include\ /S /Y
xcopy src\ChakraCore\lib\Jsrt\ChakraCommon.h .\include\ /S /Y
xcopy src\ChakraCore\lib\Jsrt\ChakraCommonWindows.h .\include\ /S /Y
xcopy src\ChakraCore\lib\Jsrt\ChakraDebug.h .\include\ /S /Y
xcopy src\ChakraCore\Build\VcBuild\bin\x64_debug\ChakraCore.lib .\lib\debug-vs2017x64\ /S /Y
xcopy src\ChakraCore\Build\VcBuild\bin\x64_debug\ChakraCore.dll .\bin\debug-vs2017x64\ /S /Y
xcopy src\ChakraCore\Build\VcBuild\bin\x64_release\ChakraCore.lib .\lib\release-vs2017x64\ /S /Y
xcopy src\ChakraCore\Build\VcBuild\bin\x64_release\ChakraCore.dll .\bin\release-vs2017x64\ /S /Y
