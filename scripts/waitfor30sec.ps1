write-output "sleeping for 30 secs"

start-sleep -s 30

$wshell = New-Object -ComObject Wscript.Shell
$wshell.Popup("done sleeping.",0,"Done",0x1)