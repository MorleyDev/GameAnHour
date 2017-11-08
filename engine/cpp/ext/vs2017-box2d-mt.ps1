[xml]$xmlDoc = Get-Content ".\src\Box2D\Box2D\Build\vs2017\Box2D.vcxproj"

foreach ($element in $xmlDoc.Project.ItemDefinitionGroup) {
	if ($element.ClCompile.Optimization -eq 'Full') {
		$newElement = $xmlDoc.CreateElement("RuntimeLibrary", $xmlDoc.DocumentElement.NamespaceURI)
		$xmlSubText = $xmlDoc.CreateTextNode("MultiThreaded")
		$newElement.AppendChild($xmlSubText)
		$element.ClCompile.AppendChild($newElement)
	}
}

$xmlDoc.Save(".\src\Box2D\Box2D\Build\vs2017\Box2D.vcxproj")
