// ==========================================
// Application Error Types
// ==========================================

use serde::Serialize;
use std::fmt;

#[derive(Debug, Serialize)]
#[serde(tag = "kind", content = "detail")]
pub enum AppError {
    Io(String),
    LockPoisoned,
    Cancelled,
    InvalidInput(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Io(msg) => write!(f, "{msg}"),
            Self::LockPoisoned => write!(f, "Internal lock error"),
            Self::Cancelled => write!(f, "Scan was cancelled"),
            Self::InvalidInput(msg) => write!(f, "Invalid input: {msg}"),
        }
    }
}

impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        Self::Io(e.to_string())
    }
}

// Tauri requires commands to return Result<T, String> or implement Into<InvokeError>.
// We convert AppError to String for Tauri IPC compatibility.
impl From<AppError> for String {
    fn from(e: AppError) -> Self {
        e.to_string()
    }
}

/// Helper to convert a poisoned lock error to AppError.
pub fn lock_err<T>(_: std::sync::PoisonError<T>) -> AppError {
    AppError::LockPoisoned
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn io_error_display() {
        let e = AppError::Io("file not found".to_string());
        assert_eq!(e.to_string(), "file not found");
    }

    #[test]
    fn cancelled_display() {
        assert_eq!(AppError::Cancelled.to_string(), "Scan was cancelled");
    }

    #[test]
    fn from_io_error() {
        let io_err = std::io::Error::new(std::io::ErrorKind::NotFound, "missing");
        let app_err = AppError::from(io_err);
        assert!(app_err.to_string().contains("missing"));
    }

    #[test]
    fn into_string() {
        let e = AppError::LockPoisoned;
        let s: String = e.into();
        assert_eq!(s, "Internal lock error");
    }
}
