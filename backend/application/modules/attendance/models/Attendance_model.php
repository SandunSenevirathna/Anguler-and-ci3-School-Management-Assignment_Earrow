<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Attendance_model extends CI_Model
{
    private $table = 'attendance';

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Save attendance record
     */
    public function save_attendance($data)
    {
        $insert_data = array(
            'student_id' => $data['student_id'],
            'date' => $data['date'],
            'present' => $data['present'] ? 1 : 0,
            'attendance_time' => $data['attendance_time'],
            'marked_by' => $data['marked_by'],
            'created_at' => date('Y-m-d H:i:s')
        );

        return $this->db->insert($this->table, $insert_data);
    }

    /**
     * Save bulk attendance with duplicate handling
     */
    public function save_bulk_attendance($attendance_data)
    {
        $success_count = 0;
        $this->db->trans_start();

        foreach ($attendance_data as $record) {
            // Check if record already exists for this student and date
            $existing = $this->db
                ->where('student_id', $record['student_id'])
                ->where('date', $record['date'])
                ->get($this->table)
                ->row();

            if ($existing) {
                // Update existing record
                $update_data = array(
                    'present' => $record['present'] ? 1 : 0,
                    'attendance_time' => $record['attendance_time'],
                    'marked_by' => $record['marked_by'],
                    'updated_at' => date('Y-m-d H:i:s')
                );

                $this->db
                    ->where('student_id', $record['student_id'])
                    ->where('date', $record['date'])
                    ->update($this->table, $update_data);

                if ($this->db->affected_rows() > 0) {
                    $success_count++;
                }
            } else {
                // Insert new record
                if ($this->save_attendance($record)) {
                    $success_count++;
                }
            }
        }

        $this->db->trans_complete();

        if ($this->db->trans_status() === FALSE) {
            return false;
        }

        return $success_count;
    }

    /**
     * Check if attendance exists for a teacher on a specific date
     */
    public function check_attendance_exists($teacher_name, $date)
    {
        $query = $this->db
            ->where('marked_by', $teacher_name)
            ->where('date', $date)
            ->get($this->table);

        return $query->num_rows() > 0;
    }

    /**
     * Delete attendance records by teacher name and date
     */
    public function delete_attendance_by_teacher_date($teacher_name, $date)
    {
        // First check if records exist
        $existing_count = $this->db
            ->where('marked_by', $teacher_name)
            ->where('date', $date)
            ->count_all_results($this->table);

        if ($existing_count === 0) {
            return 0;
        }

        // Delete the records
        $this->db
            ->where('marked_by', $teacher_name)
            ->where('date', $date)
            ->delete($this->table);

        return $this->db->affected_rows();
    }

    /**
     * Get attendance by teacher name and date
     */
    public function get_attendance_by_teacher_date($teacher_name, $date)
    {
        $query = $this->db
            ->select('a.*, s.student_name, s.class_id, CAST(a.present AS UNSIGNED) as present')
            ->from($this->table . ' a')
            ->join('student s', 'a.student_id = s.student_id', 'left')
            ->where('a.marked_by', $teacher_name)
            ->where('a.date', $date)
            ->order_by('s.student_name', 'ASC')
            ->get();

        return $query->result();
    }

    /**
     * Get attendance history for a teacher (recent 30 days)
     */
    public function get_attendance_history($teacher_name, $limit_days = 30)
    {
        $start_date = date('Y-m-d', strtotime("-{$limit_days} days"));

        $query = $this->db
            ->select('a.*, s.student_name, s.class_id, CAST(a.present AS UNSIGNED) as present')
            ->from($this->table . ' a')
            ->join('student s', 'a.student_id = s.student_id', 'left')
            ->where('a.marked_by', $teacher_name)
            ->where('a.date >=', $start_date)
            ->order_by('a.date', 'DESC')
            ->order_by('s.student_name', 'ASC')
            ->get();

        return $query->result();
    }

    /**
     * Get attendance by date range for a specific teacher
     */
    public function get_attendance_by_date_range($teacher_name, $start_date, $end_date)
    {
        $query = $this->db
            ->select('a.*, s.student_name, s.class_id, CAST(a.present AS UNSIGNED) as present')
            ->from($this->table . ' a')
            ->join('student s', 'a.student_id = s.student_id', 'left')
            ->where('a.marked_by', $teacher_name)
            ->where('a.date >=', $start_date)
            ->where('a.date <=', $end_date)
            ->order_by('a.date', 'ASC')
            ->order_by('s.student_name', 'ASC')
            ->get();

        return $query->result();
    }

    /**
     * Get all attendance by date range (for admin - all teachers)
     */
    public function get_all_attendance_by_date_range($start_date, $end_date)
    {
        $query = $this->db
            ->select('a.*, s.student_name, s.class_id, CAST(a.present AS UNSIGNED) as present')
            ->from($this->table . ' a')
            ->join('student s', 'a.student_id = s.student_id', 'left')
            ->where('a.date >=', $start_date)
            ->where('a.date <=', $end_date)
            ->order_by('a.date', 'ASC')
            ->order_by('s.student_name', 'ASC')
            ->get();

        return $query->result();
    }

    /**
     * Get attendance by date and class
     */
    public function get_attendance_by_date($date, $class_name = null)
    {
        $this->db->select('a.*, s.student_name, s.class_id, CAST(a.present AS UNSIGNED) as present');
        $this->db->from($this->table . ' a');
        $this->db->join('student s', 'a.student_id = s.student_id');
        $this->db->where('a.date', $date);

        if ($class_name) {
            $this->db->where('s.class_id', $class_name);
        }

        $this->db->order_by('s.student_name', 'ASC');
        $query = $this->db->get();
        return $query->result();
    }

    /**
     * Get attendance statistics for a teacher and date range
     */
    public function get_attendance_stats($teacher_name, $start_date, $end_date)
    {
        $query = $this->db
            ->select('date, COUNT(*) as total_students, SUM(present) as present_count')
            ->from($this->table)
            ->where('marked_by', $teacher_name)
            ->where('date >=', $start_date)
            ->where('date <=', $end_date)
            ->group_by('date')
            ->order_by('date', 'DESC')
            ->get();

        return $query->result();
    }

    /**
     * Get attendance summary statistics for date range
     */
    public function get_attendance_summary($start_date, $end_date)
    {
        // Get overall statistics
        $overall_query = $this->db
            ->select('
                COUNT(*) as total_records,
                SUM(present) as total_present,
                COUNT(DISTINCT student_id) as unique_students,
                COUNT(DISTINCT date) as total_days,
                COUNT(DISTINCT marked_by) as total_teachers
            ')
            ->from($this->table)
            ->where('date >=', $start_date)
            ->where('date <=', $end_date)
            ->get();

        $overall_stats = $overall_query->row();

        // Get daily statistics
        $daily_query = $this->db
            ->select('
                date,
                COUNT(*) as total_students,
                SUM(present) as present_count,
                ROUND((SUM(present) / COUNT(*)) * 100, 2) as attendance_percentage
            ')
            ->from($this->table)
            ->where('date >=', $start_date)
            ->where('date <=', $end_date)
            ->group_by('date')
            ->order_by('date', 'ASC')
            ->get();

        $daily_stats = $daily_query->result();

        // Get teacher statistics
        $teacher_query = $this->db
            ->select('
                marked_by as teacher_name,
                COUNT(*) as total_records,
                SUM(present) as present_count,
                ROUND((SUM(present) / COUNT(*)) * 100, 2) as attendance_percentage,
                COUNT(DISTINCT student_id) as unique_students,
                COUNT(DISTINCT date) as days_marked
            ')
            ->from($this->table)
            ->where('date >=', $start_date)
            ->where('date <=', $end_date)
            ->group_by('marked_by')
            ->order_by('teacher_name', 'ASC')
            ->get();

        $teacher_stats = $teacher_query->result();

        // Get class statistics
        $class_query = $this->db
            ->select('
                s.class_id,
                COUNT(*) as total_records,
                SUM(a.present) as present_count,
                ROUND((SUM(a.present) / COUNT(*)) * 100, 2) as attendance_percentage,
                COUNT(DISTINCT a.student_id) as unique_students
            ')
            ->from($this->table . ' a')
            ->join('student s', 'a.student_id = s.student_id', 'left')
            ->where('a.date >=', $start_date)
            ->where('a.date <=', $end_date)
            ->group_by('s.class_id')
            ->order_by('s.class_id', 'ASC')
            ->get();

        $class_stats = $class_query->result();

        return array(
            'overall' => $overall_stats,
            'daily' => $daily_stats,
            'teachers' => $teacher_stats,
            'classes' => $class_stats,
            'date_range' => array(
                'start_date' => $start_date,
                'end_date' => $end_date
            )
        );
    }

    /**
     * Get all dates when attendance was taken by a teacher
     */
    public function get_attendance_dates($teacher_name)
    {
        $query = $this->db
            ->select('DISTINCT date')
            ->from($this->table)
            ->where('marked_by', $teacher_name)
            ->order_by('date', 'DESC')
            ->get();

        return $query->result();
    }

    /**
     * Get student attendance history
     */
    public function get_student_attendance_history($student_id, $start_date = null, $end_date = null)
    {
        $this->db->select('a.*, s.student_name, s.class_id, CAST(a.present AS UNSIGNED) as present');
        $this->db->from($this->table . ' a');
        $this->db->join('student s', 'a.student_id = s.student_id', 'left');
        $this->db->where('a.student_id', $student_id);

        if ($start_date) {
            $this->db->where('a.date >=', $start_date);
        }

        if ($end_date) {
            $this->db->where('a.date <=', $end_date);
        }

        $this->db->order_by('a.date', 'DESC');
        $query = $this->db->get();

        return $query->result();
    }

    /**
     * Get attendance statistics by student for a date range
     */
    public function get_student_attendance_stats($student_id, $start_date, $end_date)
    {
        $query = $this->db
            ->select('
                COUNT(*) as total_days,
                SUM(present) as present_days,
                ROUND((SUM(present) / COUNT(*)) * 100, 2) as attendance_percentage
            ')
            ->from($this->table)
            ->where('student_id', $student_id)
            ->where('date >=', $start_date)
            ->where('date <=', $end_date)
            ->get();

        return $query->row();
    }

    /**
     * Get top/bottom performing students by attendance
     */
    public function get_student_rankings($start_date, $end_date, $limit = 10, $order = 'DESC')
    {
        $query = $this->db
            ->select('
                a.student_id,
                s.student_name,
                s.class_id,
                COUNT(*) as total_days,
                SUM(a.present) as present_days,
                ROUND((SUM(a.present) / COUNT(*)) * 100, 2) as attendance_percentage
            ')
            ->from($this->table . ' a')
            ->join('student s', 'a.student_id = s.student_id', 'left')
            ->where('a.date >=', $start_date)
            ->where('a.date <=', $end_date)
            ->group_by('a.student_id, s.student_name, s.class_id')
            ->having('total_days >', 0)
            ->order_by('attendance_percentage', $order)
            ->limit($limit)
            ->get();

        return $query->result();
    }

    /**
     * Clean up old attendance records (optional maintenance function)
     */
    public function cleanup_old_records($days = 365)
    {
        $cutoff_date = date('Y-m-d', strtotime("-{$days} days"));

        $this->db->where('date <', $cutoff_date);
        $this->db->delete($this->table);

        return $this->db->affected_rows();
    }

    /**
     * Get monthly attendance trends
     */
    public function get_monthly_trends($year = null)
    {
        if (!$year) {
            $year = date('Y');
        }

        $query = $this->db
            ->select('
                MONTH(date) as month,
                YEAR(date) as year,
                COUNT(*) as total_records,
                SUM(present) as present_count,
                ROUND((SUM(present) / COUNT(*)) * 100, 2) as attendance_percentage
            ')
            ->from($this->table)
            ->where('YEAR(date)', $year)
            ->group_by('YEAR(date), MONTH(date)')
            ->order_by('YEAR(date), MONTH(date)')
            ->get();

        return $query->result();
    }

    /**
     * Get attendance comparison between classes
     */
    public function get_class_comparison($start_date, $end_date)
    {
        $query = $this->db
            ->select('
                s.class_id,
                COUNT(*) as total_records,
                SUM(a.present) as present_count,
                ROUND((SUM(a.present) / COUNT(*)) * 100, 2) as attendance_percentage,
                COUNT(DISTINCT a.student_id) as total_students,
                COUNT(DISTINCT a.date) as days_recorded
            ')
            ->from($this->table . ' a')
            ->join('student s', 'a.student_id = s.student_id', 'left')
            ->where('a.date >=', $start_date)
            ->where('a.date <=', $end_date)
            ->group_by('s.class_id')
            ->order_by('attendance_percentage', 'DESC')
            ->get();

        return $query->result();
    }
}
