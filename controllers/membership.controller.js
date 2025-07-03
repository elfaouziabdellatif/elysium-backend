const User = require('../models/user.model');
const Member = require('../models/adherent.model');

const getAdminDashboardCharts = async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find({});
    // Filter users by role
    const memberUsers = users.filter(u => u.role === 'member');
    const coachUsers = users.filter(u => u.role === 'coach');
    const totalUsers = users.length;
    const totalMembers = memberUsers.length;
    const totalCoaches = coachUsers.length;

    console.log(`Total Users: ${totalUsers}, Total Members: ${totalMembers}, Total Coaches: ${totalCoaches}`);

    // Get all members with subscriptionStart
    const members = await Member.find({}, 'subscriptionStart user');
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    // Initialize revenue per month
    let revenuePerMonth = Array(12).fill(0);
    members.forEach(member => {
      if (!member.subscriptionStart) return;
      const start = new Date(member.subscriptionStart);
      if (isNaN(start)) return;
      // Only count months from subscriptionStart in current year
      let startMonth = start.getFullYear() === currentYear ? start.getMonth() : 0;
      let endMonth = (currentYear === new Date().getFullYear()) ? new Date().getMonth() : 11;
      for (let m = startMonth; m <= endMonth; m++) {
        revenuePerMonth[m] += 400;
      }
    });
    const revenueDataFormatted = months.map((month, idx) => ({ month, revenue: revenuePerMonth[idx] }));

    // User pie data
    const userPieData = [
      { name: 'Members', value: totalMembers },
      { name: 'Coaches', value: totalCoaches }
    ];

    res.status(200).json({
      totalUsers,
      totalMembers,
      totalCoaches,
      revenueData: revenueDataFormatted,
      userPieData
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}
module.exports = {
  getAdminDashboardCharts
};