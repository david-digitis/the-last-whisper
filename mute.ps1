# Dikto — coupe/retablit le son des sorties audio (Windows Core Audio).
# Usage: powershell -File mute.ps1 mute|unmute <stateFile>
#
# On ne cible PAS uniquement le device par defaut : avec un mixeur logiciel
# (Elgato Wave Link, Voicemeeter, Steam Streaming...) le "default endpoint"
# est souvent un device virtuel que l'utilisateur n'ecoute pas, et le couper
# n'a aucun effet audible. On mute donc tous les endpoints render ACTIFS, ce
# qui inclut la sortie physique reelle.
#
#   mute   -> coupe les endpoints non deja mutes, ecrit leurs IDs dans
#             <stateFile>, affiche "did-mute" (sinon "noop")
#   unmute -> retablit uniquement les IDs listes dans <stateFile>, puis le
#             supprime. Ne touche jamais a ce que l'utilisateur avait mute.
#
# Note: les appels COM se font dans le C# compile (interface IUnknown = vtable
#       pure, que PowerShell ne peut pas invoquer directement).
param(
    [Parameter(Mandatory = $true)][ValidateSet('mute', 'unmute')][string]$action,
    [Parameter(Mandatory = $true)][string]$stateFile
)

$ErrorActionPreference = 'Stop'
try {
    Add-Type -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;

[Guid("5CDF2C82-841E-4546-9722-0CF74078229A"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IAudioEndpointVolume {
  // 11 methodes placeholders (occupent les slots de la vtable avant SetMute/GetMute)
  int f1(); int f2(); int f3(); int f4(); int f5(); int f6();
  int f7(); int f8(); int f9(); int f10(); int f11();
  int SetMute([MarshalAs(UnmanagedType.Bool)] bool bMute, ref Guid ctx);
  int GetMute([MarshalAs(UnmanagedType.Bool)] out bool bMute);
}
[Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IMMDevice {
  int Activate(ref Guid iid, int dwClsCtx, IntPtr pActivationParams,
               [MarshalAs(UnmanagedType.IUnknown)] out object ppInterface);
  int OpenPropertyStore(int stgmAccess, out IntPtr ppProperties);
  int GetId([MarshalAs(UnmanagedType.LPWStr)] out string ppstrId);
  int GetState(out int pdwState);
}
[Guid("0BD7A1BE-7A1A-44DB-8397-CC5392387B5E"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IMMDeviceCollection {
  int GetCount(out int pcDevices);
  int Item(int nDevice, out IMMDevice ppDevice);
}
[Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IMMDeviceEnumerator {
  int EnumAudioEndpoints(int dataFlow, int dwStateMask, out IMMDeviceCollection ppDevices);
  int GetDefaultAudioEndpoint(int dataFlow, int role, out IMMDevice ppDevice);
  int GetDevice([MarshalAs(UnmanagedType.LPWStr)] string pwstrId, out IMMDevice ppDevice);
}
[ComImport, Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")]
public class MMDeviceEnumeratorComObject { }

public static class DiktoVol {
  const int eRender = 0;
  const int DEVICE_STATE_ACTIVE = 1;
  const int CLSCTX_ALL = 23;
  static Guid IID = new Guid("5CDF2C82-841E-4546-9722-0CF74078229A");

  static IAudioEndpointVolume Vol(IMMDevice dev) {
    object o;
    Marshal.ThrowExceptionForHR(dev.Activate(ref IID, CLSCTX_ALL, IntPtr.Zero, out o));
    return (IAudioEndpointVolume)o;
  }

  // Coupe chaque sortie active qui ne l'etait pas deja ; renvoie leurs IDs.
  public static string[] MuteAll() {
    IMMDeviceEnumerator e = (IMMDeviceEnumerator)(new MMDeviceEnumeratorComObject());
    IMMDeviceCollection col;
    Marshal.ThrowExceptionForHR(e.EnumAudioEndpoints(eRender, DEVICE_STATE_ACTIVE, out col));
    int n; Marshal.ThrowExceptionForHR(col.GetCount(out n));
    List<string> done = new List<string>();
    for (int i = 0; i < n; i++) {
      try {
        IMMDevice dev; col.Item(i, out dev);
        IAudioEndpointVolume v = Vol(dev);
        bool muted; Marshal.ThrowExceptionForHR(v.GetMute(out muted));
        if (muted) continue;                       // deja coupe par l'utilisateur
        Guid g = Guid.Empty;
        Marshal.ThrowExceptionForHR(v.SetMute(true, ref g));
        string id; dev.GetId(out id);
        done.Add(id);
      } catch { }                                  // endpoint recalcitrant : on ignore
    }
    return done.ToArray();
  }

  // Retablit uniquement les endpoints listes.
  public static void UnmuteIds(string[] ids) {
    IMMDeviceEnumerator e = (IMMDeviceEnumerator)(new MMDeviceEnumeratorComObject());
    foreach (string id in ids) {
      if (String.IsNullOrEmpty(id)) continue;
      try {
        IMMDevice dev;
        Marshal.ThrowExceptionForHR(e.GetDevice(id, out dev));
        Guid g = Guid.Empty;
        Marshal.ThrowExceptionForHR(Vol(dev).SetMute(false, ref g));
      } catch { }                                  // device debranche entre-temps
    }
  }
}
'@

    if ($action -eq 'mute') {
        $ids = [DiktoVol]::MuteAll()
        if ($ids.Count -gt 0) {
            Set-Content -Path $stateFile -Value $ids -Encoding utf8
            Write-Output 'did-mute'
        }
        else { Write-Output 'noop' }
    }
    else {
        if (Test-Path $stateFile) {
            $ids = @(Get-Content -Path $stateFile -Encoding utf8 | Where-Object { $_ -ne '' })
            [DiktoVol]::UnmuteIds($ids)
            Remove-Item -Path $stateFile -Force -ErrorAction SilentlyContinue
        }
        Write-Output 'ok'
    }
}
catch {
    Write-Output ('err: ' + $_.Exception.Message)
    exit 1
}
