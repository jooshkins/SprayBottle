#Requires -RunAsAdministrator
Param(
  [string]$pc,
  [string]$fl
)

write-output "script 1 launched: pc: $pc file: $fl"

$wshell = New-Object -ComObject Wscript.Shell
$wshell.Popup("script 1 launched: pc: $pc file: $fl",0,"Done",0x1)