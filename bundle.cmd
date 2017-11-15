mkdir bundle
pushd engine
    call .\buildscripts\vs2017-x64-compile.cmd
    xcopy .\bin\release-vs2017x64\* ..\bundle\ /S /Y
popd
pushd js   
   call yarn
   call yarn compile:prod
    xcopy .\dist\* ..\bundle\dist\ /S /Y
    xcopy .\assets\* ..\bundle\assets\ /S /Y
popd
