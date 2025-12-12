import logger from "#config/logger.js";
import { deleteUser, getAllUsers, getUserById, updateUser } from "#services/users.service.js";
import { formatValidationError } from "#utils/format.js";
import { userIdSchema, updateUserSchema } from "#validations/auth.validation.js";

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting users...');

    const allUsers = await getAllUsers();

    res.json({
      message: 'Successfully retrieved users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    logger.info(`Getting user by id: ${req.params.id}`);

    const validationResult = userIdSchema.safeParse({ id: req.params.id });

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { id } = validationResult.data;
    const user = await getUserById(id);

    logger.info(`User ${user.email} retrieved successfully`);
    res.json({
      message: 'User retrieved successfully',
      user,
    });
  } catch (e) {
    logger.error(`Error fetching user by id: ${e.message}`, e);
    next(e);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    logger.info(`Updating user by id: ${req.params.id}`);

    const idValidation = userIdSchema.safeParse({ id: req.params.id });
    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(idValidation.error),
      });
    }
    const { id } = idValidation.data;

    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(bodyValidation.error),
      });
    }
    const updates = bodyValidation.data;

    const updated = await updateUser(id, updates);

    logger.info(`User ${id} updated successfully`);
    res.json({
      message: 'User updated successfully',
      user: updated,
    });
  } catch (e) {
    logger.error(`Error updating user: ${e.message}`, e);

    if (e.message === "User not found") {
      return res.status(404).json({ error: "User not found" });
    }
    if (e.message === "Email already exists" || e.message === "User with this email already exists") {
      return res.status(409).json({ error: "Email already exists" });
    }

    next(e);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    logger.info(`Deleting user by id: ${req.params.id}`);

    const idValidation = userIdSchema.safeParse({ id: req.params.id });
    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(idValidation.error),
      });
    }
    const { id } = idValidation.data;

    const deleted = await deleteUser(id);

    logger.info(`User ${id} deleted successfully`);
    res.status(200).json({
      message: 'User deleted successfully',
      user: deleted,
    });
  } catch (e) {
    logger.error(`Error deleting user by id: ${e.message}`, e);

    if (e.message === "User not found") {
      return res.status(404).json({ error: "User not found" });
    }

    next(e);
  }
};
