pushd src
	git clone https://github.com/cameron314/concurrentqueue concurrentqueue
popd

xcopy src\concurrentqueue\concurrentqueue.h .\include\ /S /Y
