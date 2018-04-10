write-output "script 1 launched"

$wshell = New-Object -ComObject Wscript.Shell
$wshell.Popup("I am script 1",0,"Done",0x1)