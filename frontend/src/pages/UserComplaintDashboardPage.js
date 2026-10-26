import React, { useEffect, useState, useContext, useCallback } from 'react';
import { complaintService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './MasterScreen.css';

const StatCard = ({ label, value, color, onClick }) => (
  <div
    className="stat-card"
    style={{ borderTop: `4px solid ${color}`, cursor: onClick ? 'pointer' : 'default' }}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
  >
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const UserComplaintDashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [myStats, setMyStats] = useState({ total: 0, pending: 0, assigned: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusTarget, setStatusTarget] = useState({ complaintId: null, status: '' });
  const [selectedStatus, setSelectedStatus] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await complaintService.getAll();
      const allComplaints = res.data || [];
      
      // Filter complaints for current user: either created by them or assigned to them
      const userId = user?.id || user?._id;
      const userComplaints = allComplaints.filter((c) => {
        const createdById = c.createdBy?._id || c.createdBy;
        const assignedToId = c.assignedTo?._id || c.assignedTo;
        return (
          String(createdById) === String(userId) ||
          String(assignedToId) === String(userId)
        );
      });
      setComplaints(userComplaints);

      // Calculate stats
      const stats = {
        total: userComplaints.length,
        pending: userComplaints.filter(c => c.status === 'Pending').length,
        assigned: userComplaints.filter(c => c.status === 'Assigned').length,
        closed: userComplaints.filter(c => c.status === 'Closed').length,
      };
      setMyStats(stats);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredComplaints = filterStatus === 'All' 
    ? complaints 
    : complaints.filter(c => c.status === filterStatus);

  const viewComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedStatus(complaint.status || '');
  };

  if (loading) return <div className="master-screen"><p>Loading...</p></div>;

  return (
    <div className="master-screen">
      <div className="screen-header">
        <h1>My Complaints</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Complaint Status Dashboard */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ color: '#3b5998', marginBottom: '1.5rem', fontSize: '24px', fontWeight: '600' }}>Complaint Status Overview</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem'
        }}>
          <StatCard
            label="Total Complaints"
            value={myStats.total}
            color="#3498db"
            onClick={() => {
              setFilterStatus('All');
              if (complaints.length > 0) {
                viewComplaintDetails(complaints[0]);
              }
            }}
          />
          <StatCard
            label="Closed"
            value={myStats.closed}
            color="#27ae60"
            onClick={() => setFilterStatus('Closed')}
          />
        </div>
      </div>

      {/* Selected Complaint Details Card */}
      {selectedComplaint && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2.5rem',
          marginBottom: '2.5rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(59, 89, 152, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, color: '#3b5998', fontSize: '22px', fontWeight: '700' }}>Complaint Details</h3>
            <button
              onClick={() => setSelectedComplaint(null)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#999',
                padding: 0
              }}
            >
              ✕
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#999', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Block Name</label>
              <p style={{ margin: 0, fontSize: '16px', color: '#333', backgroundColor: '#f8f9fa', padding: '12px 14px', borderRadius: '8px', fontWeight: '500' }}>
                {selectedComplaint.blockName || '-'}
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#999', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Room Number</label>
              <p style={{ margin: 0, fontSize: '16px', color: '#333', backgroundColor: '#f8f9fa', padding: '12px 14px', borderRadius: '8px', fontWeight: '500' }}>
                {selectedComplaint.roomNumber || '-'}
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#999', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Complaint Type</label>
              <p style={{ margin: 0, fontSize: '16px', color: '#333', backgroundColor: '#f8f9fa', padding: '12px 14px', borderRadius: '8px', fontWeight: '500' }}>
                {selectedComplaint.complaintType || '-'}
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#999', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</label>
              <p style={{
                margin: 0,
                fontSize: '16px',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 
                  selectedComplaint.status === 'Closed' ? '#d4edda' :
                  selectedComplaint.status === 'Pending' ? '#fff3cd' :
                  selectedComplaint.status === 'Assigned' ? '#f8d7da' :
                  '#e2e3e5',
                color:
                  selectedComplaint.status === 'Closed' ? '#155724' :
                  selectedComplaint.status === 'Pending' ? '#856404' :
                  selectedComplaint.status === 'Assigned' ? '#721c24' :
                  '#383d41',
                fontWeight: '600'
              }}>
                {selectedComplaint.status}
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#999', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date Created</label>
              <p style={{ margin: 0, fontSize: '16px', color: '#333', backgroundColor: '#f8f9fa', padding: '12px 14px', borderRadius: '8px', fontWeight: '500' }}>
                {new Date(selectedComplaint.createdAt).toLocaleDateString()} {new Date(selectedComplaint.createdAt).toLocaleTimeString()}
              </p>
            </div>

            {selectedComplaint.assignedTo && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#999', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned To</label>
                <p style={{ margin: 0, fontSize: '16px', color: '#333', backgroundColor: '#f8f9fa', padding: '12px 14px', borderRadius: '8px', fontWeight: '500' }}>
                  {selectedComplaint.assignedTo?.username || selectedComplaint.assignedTo || '-'}
                </p>
              </div>
            )}
          </div>

          {selectedComplaint.remarks && (
            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#999', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Remarks</label>
              <p style={{ margin: 0, fontSize: '16px', color: '#333', backgroundColor: '#f8f9fa', padding: '12px 14px', borderRadius: '8px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontWeight: '500' }}>
                {selectedComplaint.remarks}
              </p>
            </div>
          )}

          {selectedComplaint.attachment && (
            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#999', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Attachment</label>
              <a href={`http://localhost:5000/${selectedComplaint.attachment}`} target="_blank" rel="noopener noreferrer" style={{
                color: '#3b5998',
                textDecoration: 'none',
                fontWeight: '600',
                display: 'inline-block',
                padding: '12px 16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#3b5998';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f8f9fa';
                e.target.style.color = '#3b5998';
              }}
              >
                📎 View Attachment
              </a>
            </div>
          )}

          {/* Allow complaint creator or SuperAdmin to update status to Pending/Closed */}
          {(user?.role === 'SuperAdmin' || (selectedComplaint.createdBy && (String(selectedComplaint.createdBy._id || selectedComplaint.createdBy) === String(user?._id || user?.id)))) && (
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ fontWeight: 700 }}>Change Status:</label>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={{ padding: '6px 8px' }}>
                <option value="">Select status</option>
                <option value="Pending">Pending</option>
                <option value="Closed">Closed</option>
              </select>
              <button
                onClick={async () => {
                  try {
                    if (!selectedStatus) return setError('Select a status');
                    await complaintService.updateStatus(selectedComplaint._id, selectedStatus);
                    await loadData();
                    // refresh selected complaint detail from latest list
                    const refreshed = (await complaintService.getById(selectedComplaint._id)).data;
                    setSelectedComplaint(refreshed);
                    setError('');
                  } catch (err) {
                    setError(err.response?.data?.message || 'Failed to update status');
                  }
                }}
                className="btn-primary"
                style={{ padding: '8px 12px' }}
              >
                Save
              </button>
            </div>
          )}
        </div>
      )}

      {/* Complaints List */}
      <div className="table-container">
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#3b5998', fontSize: '18px', fontWeight: '600' }}>
            {filterStatus === 'All' ? 'All Complaints' : `${filterStatus} Complaints`}
          </h3>
          <button 
            onClick={() => setFilterStatus('All')} 
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b5998',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Reset Filter
          </button>
        </div>

        <table className="master-table">
          <thead>
            <tr>
              <th>Block</th>
              <th>Room</th>
              <th>Type</th>
              <th>Status</th>
              <th>Date Created</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.length > 0 ? (
              filteredComplaints.map((complaint) => (
                <tr key={complaint._id} onClick={() => viewComplaintDetails(complaint)} style={{ cursor: 'pointer' }}>
                  <td>{complaint.blockName || '-'}</td>
                  <td>{complaint.roomNumber || '-'}</td>
                  <td>{complaint.complaintType || '-'}</td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: 
                        complaint.status === 'Closed' ? '#d4edda' :
                        complaint.status === 'Pending' ? '#fff3cd' :
                        complaint.status === 'Assigned' ? '#f8d7da' :
                        '#e2e3e5',
                      color:
                        complaint.status === 'Closed' ? '#155724' :
                        complaint.status === 'Pending' ? '#856404' :
                        complaint.status === 'Assigned' ? '#721c24' :
                        '#383d41'
                    }}>
                      {complaint.status}
                    </span>
                  </td>
                  <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                  <td>{complaint.remarks?.substring(0, 30) || '-'}...</td>
                  <td>
                    {/* Update status control for assigned staff (not SuperAdmin) */}
                    {String(complaint.assignedTo?._id || complaint.assignedTo) === String(user?._id || user?.id) && user?.role !== 'SuperAdmin' ? (
                      <div onClick={(e) => e.stopPropagation()}>
                        {statusTarget.complaintId === complaint._id ? (
                          <div className={`status-action open`} onClick={(e) => e.stopPropagation()}>
                            <select
                              className="status-select"
                              value={statusTarget.status}
                              onChange={(e) => setStatusTarget({ ...statusTarget, status: e.target.value })}
                              aria-label="Select status"
                            >
                              <option value="">Select status</option>
                              <option value="In-Progress">In-Progress</option>
                              <option value="Onhold">Onhold</option>
                              <option value="Closed">Completed</option>
                            </select>

                            <div className="status-buttons show">
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    if (!statusTarget.status) return setError('Select a status');
                                    await complaintService.updateStatus(statusTarget.complaintId, statusTarget.status);
                                    await loadData();
                                    setStatusTarget({ complaintId: null, status: '' });
                                    setError('');
                                  } catch (err) {
                                    setError(err.response?.data?.message || 'Failed to update status');
                                  }
                                }}
                                className="btn-primary status-save"
                                aria-label="Save status"
                              >
                                Save
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setStatusTarget({ complaintId: null, status: '' }); }}
                                className="btn-secondary status-cancel"
                                aria-label="Cancel status"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); setStatusTarget({ complaintId: complaint._id, status: '' }); }}
                            className="btn-primary status-trigger"
                          >
                            Update Status
                          </button>
                        )}
                      </div>
                    ) : (
                      '-' 
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  No {filterStatus === 'All' ? 'complaints' : `${filterStatus.toLowerCase()} complaints`} found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserComplaintDashboardPage;
