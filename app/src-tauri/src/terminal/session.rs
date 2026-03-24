use anyhow::Result;
use portable_pty::{native_pty_system, CommandBuilder, PtyPair, PtySize};
use std::io::{Read, Write};

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc::{self, Receiver};
use std::sync::Arc;
use std::thread;
use uuid::Uuid;

use crate::types::{get_default_shell, AgentType, SessionStatus, TerminalSession};

pub struct PtySession {
    pub session: TerminalSession,
    pub pair: PtyPair,
    pub writer: Box<dyn Write + Send>,
    pub kill_flag: Arc<AtomicBool>,
}

impl PtySession {
    pub fn create(
        workspace_id: String,
        index: usize,
        cwd: String,
        agent: Option<AgentType>,
    ) -> Result<(Self, Receiver<Vec<u8>>)> {
        let pty_system = native_pty_system();
        let pair = pty_system.openpty(PtySize {
            rows: 24,
            cols: 80,
            pixel_width: 0,
            pixel_height: 0,
        })?;

        let shell = get_default_shell();
        let session_id = Uuid::new_v4().to_string();

        println!("PtySession::create: shell={}, cwd={}", shell, cwd);

        let session = TerminalSession {
            id: session_id.clone(),
            workspace_id,
            index,
            cwd: cwd.clone(),
            agent,
            status: SessionStatus::Idle,
            shell: shell.clone(),
        };

        let mut cmd = CommandBuilder::new(&shell);
        cmd.cwd(cwd);

        // Add flags to hide the window for PowerShell
        if shell.to_lowercase().contains("powershell") || shell.to_lowercase().contains("pwsh") {
            cmd.arg("-NoLogo");
        }

        println!("Spawning command: {:?}", cmd);
        let _child = pair.slave.spawn_command(cmd)?;
        println!("Command spawned successfully");

        let writer = pair.master.take_writer()?;

        let (output_tx, output_rx) = mpsc::channel();

        let kill_flag = Arc::new(AtomicBool::new(false));
        let kill_flag_clone = kill_flag.clone();
        let output_tx_clone = output_tx.clone();

        let mut reader = pair.master.try_clone_reader()?;
        thread::spawn(move || {
            let mut buf = [0u8; 4096];
            loop {
                if kill_flag_clone.load(Ordering::Relaxed) {
                    break;
                }
                match reader.read(&mut buf) {
                    Ok(0) => break,
                    Ok(n) => {
                        if output_tx_clone.send(buf[..n].to_vec()).is_err() {
                            break;
                        }
                    }
                    Err(e) => {
                        if e.kind() != std::io::ErrorKind::WouldBlock {
                            break;
                        }
                    }
                }
            }
        });

        drop(output_tx);

        Ok((
            PtySession {
                session,
                pair,
                writer,
                kill_flag,
            },
            output_rx,
        ))
    }

    pub fn write(&mut self, data: &[u8]) -> Result<()> {
        self.writer.write_all(data)?;
        self.writer.flush()?;
        Ok(())
    }

    pub fn resize(&self, cols: u16, rows: u16) -> Result<()> {
        self.pair.master.resize(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        })?;
        Ok(())
    }

    pub fn kill(&mut self) {
        self.kill_flag.store(true, Ordering::Relaxed);
        let _ = self.writer.write_all(&[3]);
        let _ = self.writer.flush();
    }

    pub fn get_session(&self) -> &TerminalSession {
        &self.session
    }
}
