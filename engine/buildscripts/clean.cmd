rmdir bin /S /Q
rmdir build /S /Q
pushd ext
	call clean.cmd
popd
