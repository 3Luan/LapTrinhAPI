const userModel = require("../models/UserModel");
const { google } = require("googleapis");

let getPlaylistId = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await userModel.findById(userId);
    if (!user) {
      throw {
        code: 1,
        message: "Lỗi: Người dùng không tồn tại",
      };
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: user.accessToken });

    const youtube = google.youtube({ version: "v3", auth });

    const response = await youtube.channels.list({
      part: "id",
      mine: true,
    });

    const channels = response.data.items;

    if (!channels.length) {
      throw {
        code: 1,
        message: "Không tìm thấy kênh của người dùng",
      };
    }

    const channelId = channels[0].id;

    const playlistsResponse = await youtube.playlists.list({
      part: "snippet,contentDetails",
      channelId: channelId,
      maxResults: 25,
    });

    const playlists = playlistsResponse.data.items;

    if (!playlists.length) {
      throw {
        code: 1,
        message: "Không tìm thấy danh sách phát cho kênh này",
      };
    }

    const playlistsWithFirstVideoId = await Promise.all(
      playlists.map(async (playlist) => {
        try {
          const playlistItemsResponse = await youtube.playlistItems.list({
            part: "snippet,contentDetails",
            playlistId: playlist.id,
            maxResults: 1,
          });

          const firstVideo = playlistItemsResponse.data.items[0];
          return {
            ...playlist,
            firstVideoId: firstVideo ? firstVideo.contentDetails.videoId : "",
          };
        } catch (error) {
          console.error(
            `Failed to get first video for playlist ${playlist.id}`,
            error
          );
          return {
            ...playlist,
            firstVideoId: "",
          };
        }
      })
    );

    console.log("playlistsWithFirstVideoId", playlistsWithFirstVideoId);

    res.status(200).json({
      code: 0,
      message: "Lấy tất cả ID danh sách phát và video đầu tiên thành công",
      data: playlistsWithFirstVideoId,
    });
  } catch (error) {
    console.error(error);
    res.status(200).json({
      code: error.code || 1,
      message: error.message || "Lỗi: getPlaylistId",
    });
  }
};

let getPlaylistVideos = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = req.userId;

    const user = await userModel.findById(userId);
    if (!user) {
      throw {
        code: 1,
        message: "Lỗi: Người dùng không tồn tại",
      };
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: user.accessToken });

    const youtube = google.youtube({ version: "v3", auth });

    const response = await youtube.playlistItems.list({
      part: "snippet,contentDetails",
      playlistId: playlistId,
      maxResults: 25,
    });

    const videos = response.data.items;

    if (!videos.length) {
      throw {
        code: 1,
        message: "Không tìm thấy video trong danh sách phát này",
      };
    }

    res.status(200).json({
      code: 0,
      message: "Lấy danh sách video trong playlist thành công",
      data: videos,
    });
  } catch (error) {
    console.error(error);
    res.status(200).json({
      code: error.code || 1,
      message: error.message || "Lỗi: getPlaylistVideos",
    });
  }
};

module.exports = { getPlaylistId, getPlaylistVideos };

// let CreatePlaylist = async (req, res) => {
//   try {
//     const { title, videoId } = req.body;
//     const userId = req.userId;

//     if (!userId || !title || !videoId) {
//       throw {
//         code: 1,
//         message: "Lỗi: Thông tin không đủ",
//       };
//     }

//     // Tìm người dùng
//     const user = await userModel.findById(userId);

//     // Nếu người dùng không tồn tại
//     if (!user) {
//       throw {
//         code: 1,
//         message: "Lỗi: Người dùng không tồn tại",
//       };
//     }

//     // Tìm danh sách phát của người dùng
//     const playlist = await playlistModel.findOne({ title, userId });

//     // Nếu danh sách phát không tồn tại, tạo mới
//     if (!playlist) {
//       const newPlaylist = new playlistModel({
//         title,
//         videos: [videoId],
//       });

//       await newPlaylist.save();
//       user.playlist.push(newPlaylist._id);
//     } else {
//       // Nếu danh sách phát đã tồn tại, thêm video vào danh sách
//       playlist.videos.push(videoId);
//       await playlist.save();
//     }

//     await user.save();

//     res.status(200).json({
//       code: 0,
//       message: "Thêm video vào danh sách phát thành công",
//       playlist: user.playlist,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(200).json({
//       code: error.code || 1,
//       message: error.message || "Đã có lỗi xảy ra: CreatePlaylist",
//     });
//   }
// };

// let getHistory = async (req, res) => {
//   try {
//     const userId = req.userId;

//     // Tìm người dùng theo userId
//     const user = await userModel.findById(userId);

//     // Kiểm tra nếu không tìm thấy người dùng
//     if (!user) {
//       throw {
//         code: 1,
//         message: "Lỗi: Người dùng không tồn tại",
//       };
//     }

//     // Trả về lịch sử của người dùng
//     res.status(200).json({
//       code: 0,
//       message: "Lấy video đã xem thành công",
//       history: user.history,
//     });
//   } catch (error) {
//     res.status(200).json({
//       code: error.code || 1,
//       message: error.message || "Đã có lỗi xảy ra: getHistory",
//     });
//   }
// };
