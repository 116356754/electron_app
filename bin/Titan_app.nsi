; Script generated by the HM NIS Edit Script Wizard.

; HM NIS Edit Wizard helper defines
!define PRODUCT_NAME "Titan app update"
!define PRODUCT_VERSION "1.5.1"
!define PRODUCT_PUBLISHER "erayt, Inc."
!define PRODUCT_WEB_SITE "http://www.erayt.com"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
!define PRODUCT_UNINST_ROOT_KEY "HKLM"

; MUI 1.67 compatible ------
!include "MUI.nsh"
!include "nsProcess.nsh"

; MUI Settings
!define MUI_ABORTWARNING
!define MUI_ICON "app/static/logo.ico"

!insertmacro MUI_PAGE_INSTFILES

!define MUI_FINISHPAGE_RUN "$PROGRAMFILES\Titan\Titan.exe"
; Finish page
;!insertmacro MUI_PAGE_FINISH

; Uninstaller pages
;!insertmacro MUI_UNPAGE_INSTFILES

; Language files
;!insertmacro MUI_LANGUAGE "English"

!define PRODUCT_DIR_REGKEY "Software\Microsoft\Windows\CurrentVersion\App Paths\Titan.exe"


; MUI end ------

Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile "Titan_app.exe"
;InstallDir "$PROGRAMFILES\Titan"
;ShowInstDetails show
;ShowUnInstDetails show
InstallDir "$PROGRAMFILES\Titan\resources\"

Function .onInit
  SetSilent silent
  ${nsProcess::KillProcess} "Titan.exe" $R2
  Sleep 2000
FunctionEnd

Section "MainSection" SEC01
  SetOverwrite on
  
  SetOutPath "$INSTDIR"
  File /r "electron_app\resources\*.*"
SectionEnd

Function .onInstSuccess
   Exec "$PROGRAMFILES\Titan\Titan.exe"
   ;MessageBox MB_OK "资源文件更新成功,请重启打开应用程序"
FunctionEnd

