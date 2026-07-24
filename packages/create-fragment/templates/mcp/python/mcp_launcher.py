"""Self-bootstrapping launcher that binds the MCP server child to a Windows Job Object with
KILL_ON_JOB_CLOSE (rule 5), so when the host (Claude) closes the launcher the OS reaps the
server -- no orphaned process survives a crash or disconnect. On non-Windows the server runs
in its own process group and is killed on launcher exit.

The server inherits THIS process's stdio (the host's JSON-RPC pipes) -- that is correct: the
server IS the JSON-RPC endpoint. Only shelled-out grandchildren get stdin=DEVNULL (see _hygiene).

Wire it in .mcp.json:  { "command": "python", "args": ["apps/mcp/python/mcp_launcher.py"] }
"""
from __future__ import annotations

import atexit
import os
import signal
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SERVER = HERE / "server.py"


if sys.platform == "win32":
    import ctypes
    from ctypes import wintypes

    JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE = 0x2000
    JobObjectExtendedLimitInformation = 9
    PROCESS_ALL_ACCESS = 0x1F0FFF

    class JOBOBJECT_BASIC_LIMIT_INFORMATION(ctypes.Structure):
        _fields_ = [
            ("PerProcessUserTimeLimit", wintypes.LARGE_INTEGER),
            ("PerJobUserTimeLimit", wintypes.LARGE_INTEGER),
            ("LimitFlags", wintypes.DWORD),
            ("MinimumWorkingSetSize", ctypes.c_size_t),
            ("MaximumWorkingSetSize", ctypes.c_size_t),
            ("ActiveProcessLimit", wintypes.DWORD),
            ("Affinity", ctypes.POINTER(wintypes.ULONG)),
            ("PriorityClass", wintypes.DWORD),
            ("SchedulingClass", wintypes.DWORD),
        ]

    class IO_COUNTERS(ctypes.Structure):
        _fields_ = [
            ("ReadOperationCount", ctypes.c_ulonglong),
            ("WriteOperationCount", ctypes.c_ulonglong),
            ("OtherOperationCount", ctypes.c_ulonglong),
            ("ReadTransferCount", ctypes.c_ulonglong),
            ("WriteTransferCount", ctypes.c_ulonglong),
            ("OtherTransferCount", ctypes.c_ulonglong),
        ]

    class JOBOBJECT_EXTENDED_LIMIT_INFORMATION(ctypes.Structure):
        _fields_ = [
            ("BasicLimitInformation", JOBOBJECT_BASIC_LIMIT_INFORMATION),
            ("IoInfo", IO_COUNTERS),
            ("ProcessMemoryLimit", ctypes.c_size_t),
            ("JobMemoryLimit", ctypes.c_size_t),
            ("PeakProcessMemoryUsed", ctypes.c_size_t),
            ("PeakJobMemoryUsed", ctypes.c_size_t),
        ]

    def _bind_kill_on_close(pid: int):
        """Create a KILL_ON_JOB_CLOSE job and assign the child. Returns the job handle, which
        MUST stay open for the launcher's lifetime -- closing it (on exit) reaps the child."""
        k32 = ctypes.WinDLL("kernel32", use_last_error=True)
        job = k32.CreateJobObjectW(None, None)
        if not job:
            return None
        info = JOBOBJECT_EXTENDED_LIMIT_INFORMATION()
        info.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
        k32.SetInformationJobObject(
            job, JobObjectExtendedLimitInformation, ctypes.byref(info), ctypes.sizeof(info)
        )
        handle = k32.OpenProcess(PROCESS_ALL_ACCESS, False, pid)
        k32.AssignProcessToJobObject(job, handle)
        return job

    def main() -> int:
        proc = subprocess.Popen([sys.executable, str(SERVER)])
        _job = _bind_kill_on_close(proc.pid)  # kept alive by local scope until wait() returns
        return proc.wait()

else:

    def main() -> int:
        proc = subprocess.Popen([sys.executable, str(SERVER)], start_new_session=True)

        def _kill() -> None:
            try:
                os.killpg(proc.pid, signal.SIGTERM)
            except (ProcessLookupError, PermissionError):
                pass

        atexit.register(_kill)
        return proc.wait()


if __name__ == "__main__":
    sys.exit(main())
