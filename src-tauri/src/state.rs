// ==========================================
// State Management for Drive Cleaner
// ==========================================

use std::sync::Mutex;
use tokio_util::sync::CancellationToken;

pub struct ScanState {
    pub cancel_token: Mutex<Option<CancellationToken>>,
}

impl Default for ScanState {
    fn default() -> Self {
        Self {
            cancel_token: Mutex::new(None),
        }
    }
}
