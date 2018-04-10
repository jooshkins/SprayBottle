write-output "script 2 launched"

$wshell = New-Object -ComObject Wscript.Shell
$wshell.Popup("I am script 2",0,"Done",0x1)